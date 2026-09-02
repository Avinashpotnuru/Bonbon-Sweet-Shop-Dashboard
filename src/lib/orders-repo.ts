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

  const update: Partial<OrderDoc> = { updatedAt: new Date() };
  if (data.customerName !== undefined) update.customerName = data.customerName as string;
  if (data.itemCount !== undefined) update.itemCount = data.itemCount as number;
  if (data.total !== undefined) update.total = data.total as number;
  if (data.status !== undefined) update.status = data.status as OrderDoc["status"];
  if (data.placedAt !== undefined) update.placedAt = new Date(data.placedAt as string);

  const result = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );
  return result ? serializeOrder(result) : null;
}

export async function deleteOrder(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<OrderDoc>(COLLECTIONS.orders)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
