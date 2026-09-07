"use server";

import { z } from "zod";
import { ObjectId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { checkoutSchema } from "@/lib/checkout-schemas";
import {
  computeTotals,
  type CartPricingLine,
  type CouponPricing,
} from "@/lib/cart-pricing";
import { ORDER_STATUSES } from "@/lib/order-schemas";
import type { PlacedOrder } from "@/lib/placed-order";
import { getSession } from "@/lib/auth";
import { getActiveCouponByCode, bumpCouponUsage } from "@/lib/coupon-repo";
import { sendOrderConfirmationEmail } from "@/lib/notifications";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

/** Each cart line the client sends. Prices are ignored — re-derived from DB. */
const checkoutLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(999),
});

const placeOrderSchema = checkoutSchema.extend({
  promoCode: z.string().trim().max(32).optional().or(z.literal("")),
  items: z.array(checkoutLineSchema).min(1, "Your cart is empty."),
  razorpay: z
    .object({
      orderId: z.string().min(1),
      paymentId: z.string().min(1),
      signature: z.string().min(1),
    })
    .optional(),
});

type CheckoutData = z.infer<typeof placeOrderSchema>;

type LineItem = {
  productId: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
};

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string; code?: string };

export type RazorpayCheckoutResult =
  | { ok: true; razorpay: { id: string; amount: number; currency: string } }
  | { ok: false; error: string; code?: string };

type CheckoutFailure = { ok: false; error: string; code?: string };

type ResolveResult =
  | {
      ok: true;
      session: { userId: string };
      data: CheckoutData;
      totals: ReturnType<typeof computeTotals>;
      coupon: string | null;
      lineItems: LineItem[];
    }
  | { ok: false; result: CheckoutFailure };

/**
 * Validates the payload, then re-reads authoritative product prices from the
 * DB and recomputes subtotal / discount / delivery / total — the client's
 * numbers are never trusted. Shared by `placeOrder` and `createRazorpayCheckout`.
 */
async function resolveCheckout(input: unknown): Promise<ResolveResult> {
  // Every order must come from a signed-in storefront customer. This guard
  // cannot be bypassed by calling the server action directly.
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return {
      ok: false,
      result: {
        ok: false,
        code: "LOGIN_REQUIRED",
        error: "Please sign in to your account before placing an order.",
      },
    };
  }

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "VALIDATION",
        error: parsed.error.issues[0]?.message ?? "Please check your details.",
      },
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
  const lineItems: LineItem[] = [];

  for (const line of data.items) {
    const product = byId.get(line.productId);
    if (!product) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "UNAVAILABLE",
          error: "One of the items in your cart is no longer available.",
        },
      };
    }
    pricing.push({ price: product.price, quantity: line.quantity });
    lineItems.push({ ...product, productId: line.productId, quantity: line.quantity });
  }

  let coupon: string | null = null;
  let couponPricing: CouponPricing | null = null;
  if (data.promoCode?.trim()) {
    const couponDoc = await getActiveCouponByCode(data.promoCode);
    if (!couponDoc) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "INVALID_COUPON",
          error: "That promo code is invalid or has expired.",
        },
      };
    }
    coupon = couponDoc.code;
    couponPricing = { label: couponDoc.label, percent: couponDoc.percent / 100 };
  }
  const totals = computeTotals(pricing, couponPricing);

  return { ok: true, session, data, totals, coupon, lineItems };
}

/**
 * Places a customer order. Runs entirely server-side:
 *  1. validates the payload
 *  2. re-reads authoritative product prices from the DB
 *  3. recomputes subtotal / discount / delivery / total (never trusts the client)
 *  4. for Razorpay payments, verifies the payment signature first
 *  5. atomically decrements stock (guards against overselling)
 *  6. persists a full order record
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const resolved = await resolveCheckout(input);
  if (!resolved.ok) return resolved.result;

  const { session, data, totals, coupon, lineItems } = resolved;

  if (data.paymentMethod === "Razorpay") {
    if (!isRazorpayConfigured()) {
      return {
        ok: false,
        code: "PAYMENT_UNAVAILABLE",
        error: "Card payments are currently unavailable. Please choose Cash on Delivery instead.",
      };
    }
    if (!data.razorpay) {
      return {
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Please complete the payment before placing your order.",
      };
    }
    const verified = await verifyRazorpaySignature(data.razorpay);
    if (!verified) {
      return {
        ok: false,
        code: "PAYMENT_VERIFICATION",
        error: "We couldn't verify your payment. Please contact our support team.",
      };
    }
  }

  const db = getDb();

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
    razorpayPaymentId: data.razorpay?.paymentId || null,
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

  if (coupon) {
    // Track coupon usage (past the point of no return — the order is saved).
    await bumpCouponUsage(coupon).catch(() => {});
  }

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

  // Fire-and-forget confirmation email — must never block or fail the order.
  void sendOrderConfirmationEmail({
    to: data.email,
    order: placedOrder,
  }).catch(() => {});

  return { ok: true, order: placedOrder };
}

/**
 * Prepares a Razorpay checkout for the customer's cart without placing the
 * order. Server-side totals in the smallest currency unit (paise/cents) are
 * sent to Razorpay; the order is only persisted after `placeOrder` verifies
 * the payment signature.
 */
export async function createRazorpayCheckout(
  input: unknown,
): Promise<RazorpayCheckoutResult> {
  const resolved = await resolveCheckout(input);
  if (!resolved.ok) return resolved.result;

  const { data, totals } = resolved;

  if (data.paymentMethod !== "Razorpay") {
    return {
      ok: false,
      code: "PAYMENT_METHOD",
      error: "Please select a payment method.",
    };
  }
  if (!isRazorpayConfigured()) {
    return {
      ok: false,
      code: "PAYMENT_UNAVAILABLE",
      error: "Card payments are currently unavailable. Please choose Cash on Delivery instead.",
    };
  }

  try {
    const payment = await createRazorpayOrder({
      amount: Math.round(totals.total * 100),
      receipt: `so_${Date.now()}`,
      notes: { email: data.email, name: data.customerName },
    });
    return { ok: true, razorpay: payment };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    return {
      ok: false,
      code: "PAYMENT_SETUP",
      error: detail
        ? `We couldn't set up your payment — ${detail}`
        : "We couldn't set up your payment. Please try again.",
    };
  }
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