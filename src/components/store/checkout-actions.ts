"use server";

import { z } from "zod";
import { ObjectId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { checkoutSchema } from "@/lib/checkout-schemas";
import {
  computeTotals,
  normalizeCoupon,
  type CartPricingLine,
} from "@/lib/cart-pricing";
import { ORDER_STATUSES } from "@/lib/order-schemas";
import type { PlacedOrder } from "@/lib/placed-order";
import { getSession } from "@/lib/auth";

/** Each cart line the client sends. Prices are ignored — re-derived from DB. */
const checkoutLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(999),
});

const placeOrderSchema = checkoutSchema.extend({
  promoCode: z.string().trim().max(32).optional().or(z.literal("")),
  items: z.array(checkoutLineSchema).min(1, "Your cart is empty."),
});

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string; code?: string };

/**
 * Places a customer order. Runs entirely server-side:
 *  1. validates the payload
 *  2. re-reads authoritative product prices from the DB
 *  3. recomputes subtotal / discount / delivery / total (never trusts the client)
 *  4. atomically decrements stock (guards against overselling)
 *  5. persists a full order record
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  // Every order must come from a signed-in storefront customer. This guard
  // cannot be bypassed by calling the server action directly.
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return {
      ok: false,
      code: "LOGIN_REQUIRED",
      error: "Please sign in to your account before placing an order.",
    };
  }

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      error: parsed.error.issues[0]?.message ?? "Please check your details.",
    };
  }

  const data = parsed.data;
  const db = getDb();

  // Resolve authoritative products + prices from the DB.
  const ids = data.items.map((i) => i.productId);
  const objectIds = ids.map((id) => {
    try {
      return new ObjectId(id);
    } catch {
      return null;
    }
  });

  const productDocs =
    objectIds.every((oid) => oid) === false
      ? []
      : await db
          .collection(COLLECTIONS.products)
          .find({ _id: { $in: objectIds as ObjectId[] } })
          .toArray();

  // We need to build pricing lines from the resolved docs. Keep a map by id.
  const byId = new Map<string, { name: string; price: number; category: string }>();
  for (const doc of productDocs) {
    const key = doc._id.toString();
    byId.set(key, {
      name: doc.name,
      price: doc.price,
      category: doc.category,
    });
  }

  const pricing: CartPricingLine[] = [];
  const lineItems: Array<{
    productId: string;
    name: string;
    price: number;
    category: string;
    quantity: number;
  }> = [];

  for (const line of data.items) {
    const product = byId.get(line.productId);
    if (!product) {
      return {
        ok: false,
        code: "UNAVAILABLE",
        error: "One of the items in your cart is no longer available.",
      };
    }
    pricing.push({ price: product.price, quantity: line.quantity });
    lineItems.push({ ...product, productId: line.productId, quantity: line.quantity });
  }

  const coupon = normalizeCoupon(data.promoCode || null);
  const totals = computeTotals(pricing, coupon);

  // Update stock atomically, rejecting any item that would go negative.
  for (const line of lineItems) {
    const oid = new ObjectId(line.productId);
    const result = await db
      .collection(COLLECTIONS.products)
      .updateOne(
        { _id: oid, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity }, $set: { updatedAt: new Date() } },
      );
    if (result.matchedCount === 0) {
      return {
        ok: false,
        code: "OUT_OF_STOCK",
        error: `${line.name} is out of stock. Please adjust your cart and try again.`,
      };
    }
  }

  const now = new Date();
  const orderNumber = await nextOrderNumber();

  const orderDoc = {
    orderNumber,
    customerUserId: session.userId,
    customerName: data.customerName,
    itemCount: totals.count,
    total: totals.total,
    status: ORDER_STATUSES[0], // "Pending" — awaiting payment/delivery
    placedAt: now,
    updatedAt: now,
    // Extended storefront fields
    customerEmail: data.email,
    customerPhone: data.phone,
    address: {
      line1: data.addressLine1,
      line2: data.addressLine2 || "",
      city: data.city,
      state: data.state || "",
      postalCode: data.postalCode,
    },
    notes: data.notes || "",
    paymentMethod: data.paymentMethod,
    coupon: coupon,
    amounts: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      delivery: totals.delivery,
      total: totals.total,
    },
    items: lineItems,
  };

  await db.collection(COLLECTIONS.orders).insertOne(orderDoc);

  const placedOrder: PlacedOrder = {
    orderNumber,
    customerName: data.customerName,
    customerEmail: data.email,
    customerPhone: data.phone,
    address: {
      line1: data.addressLine1,
      line2: data.addressLine2 || "",
      city: data.city,
      state: data.state || "",
      postalCode: data.postalCode,
    },
    paymentMethod: data.paymentMethod,
    coupon,
    placedAt: now.toISOString(),
    items: lineItems,
    amounts: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      delivery: totals.delivery,
      total: totals.total,
    },
  };

  return { ok: true, order: placedOrder };
}

async function nextOrderNumber(): Promise<string> {
  const db = getDb();
  const last = await db
    .collection(COLLECTIONS.orders)
    .findOne({}, { sort: { orderNumber: -1 as const } });
  if (!last?.orderNumber) return "SO-1001";
  const match = /(\d+)$/.exec(String(last.orderNumber));
  const num = match ? parseInt(match[1], 10) + 1 : 1002;
  return `SO-${num}`;
}
