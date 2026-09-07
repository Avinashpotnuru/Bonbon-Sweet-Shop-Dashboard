import "server-only";

import { ObjectId, type Sort, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ORDER_STATUSES, type OrderListInput } from "@/lib/order-schemas";

export type OrderDoc = {
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: (typeof ORDER_STATUSES)[number];
  placedAt: Date;
  updatedAt: Date;
};

type OrderWithItems = OrderDoc & {
  customerUserId?: string;
  items?: Array<{ productId: string; quantity: number }>;
};

export type SerializableOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: (typeof ORDER_STATUSES)[number];
  placedAt: string;
};

const SORT_WHITELIST: Record<string, 1 | -1> = {
  orderNumber: 1,
  customerName: 1,
  itemCount: 1,
  total: 1,
  status: 1,
  placedAt: 1,
};

export function serializeOrder(doc: WithId<OrderDoc>): SerializableOrder {
  return {
    id: doc._id.toHexString(),
    orderNumber: doc.orderNumber,
    customerName: doc.customerName,
    itemCount: doc.itemCount,
    total: doc.total,
    status: doc.status,
    placedAt: doc.placedAt.toISOString(),
  };
}

async function nextOrderNumber(): Promise<string> {
  const db = getDb();
  const last = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .findOne({}, { sort: { orderNumber: -1 as const } });
  if (!last) return "SO-1001";
  const match = /(\d+)$/.exec(last.orderNumber);
  const num = match ? parseInt(match[1], 10) + 1 : 1002;
  return `SO-${num}`;
}

/** Restores product stock for the line items of a cancelled/deleted order. */
async function restoreStock(items: OrderWithItems["items"]): Promise<void> {
  if (!items?.length) return;
  const db = getDb();
  for (const item of items) {
    if (!ObjectId.isValid(item.productId)) continue;
    const quantity = Math.max(0, Math.floor(Number(item.quantity)));
    if (!quantity) continue;
    await db.collection(COLLECTIONS.products).updateOne(
      { _id: new ObjectId(item.productId) },
      { $inc: { stock: quantity }, $set: { updatedAt: new Date() } },
    );
  }
}

export async function listOrders(input: OrderListInput) {
  const db = getDb();
  const filter: Record<string, unknown> = {};

  if (input.search.trim()) {
    const q = input.search.trim();
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { customerName: { $regex: q, $options: "i" } },
    ];
  }

  if (input.status && input.status !== "all" && ORDER_STATUSES.includes(input.status as never)) {
    filter.status = input.status;
  }

  const direction = input.sortDirection === "desc" ? -1 : 1;
  const sortField = input.sortField in SORT_WHITELIST ? input.sortField : "placedAt";
  const sort: Sort = { [sortField]: direction as 1 | -1 };
  const page = input.page;
  const pageSize = input.pageSize;

  const [docs, total] = await Promise.all([
    db
      .collection<OrderDoc>(COLLECTIONS.orders)
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    db.collection<OrderDoc>(COLLECTIONS.orders).countDocuments(filter),
  ]);

  return {
    items: docs.map(serializeOrder),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createOrder(data: {
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderDoc["status"];
  placedAt: Date;
}) {
  const db = getDb();
  const doc: OrderDoc = {
    orderNumber: await nextOrderNumber(),
    customerName: data.customerName,
    itemCount: data.itemCount,
    total: data.total,
    status: data.status,
    placedAt: data.placedAt,
    updatedAt: new Date(),
  };

  const result = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .insertOne(doc);
  return serializeOrder({ ...doc, _id: result.insertedId });
}

export async function updateOrder(id: string, data: Record<string, unknown>) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const oid = new ObjectId(id);
  const existing = await db
    .collection<OrderWithItems>(COLLECTIONS.orders)
    .findOne({ _id: oid });
  if (!existing) return null;

  const update: Partial<OrderDoc> = { updatedAt: new Date() };
  if (data.customerName !== undefined) update.customerName = data.customerName as string;
  if (data.itemCount !== undefined) update.itemCount = data.itemCount as number;
  if (data.total !== undefined) update.total = data.total as number;
  if (data.status !== undefined) update.status = data.status as OrderDoc["status"];
  if (data.placedAt !== undefined) update.placedAt = new Date(data.placedAt as string);

  // Cancelling returns the ordered stock to inventory (only the first time).
  if (update.status === "Cancelled" && existing.status !== "Cancelled") {
    await restoreStock(existing.items);
  }

  const result = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .findOneAndUpdate(
      { _id: oid },
      { $set: update },
      { returnDocument: "after" },
    );
  return result ? serializeOrder(result) : null;
}

export async function deleteOrder(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;

  const oid = new ObjectId(id);
  const existing = await db
    .collection<OrderWithItems>(COLLECTIONS.orders)
    .findOne({ _id: oid });
  if (!existing) return false;

  // Deleting also returns the ordered stock to inventory.
  await restoreStock(existing.items);

  const result = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .deleteOne({ _id: oid });
  return result.deletedCount === 1;
}
