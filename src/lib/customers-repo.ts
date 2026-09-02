import "server-only";

import { ObjectId, type Sort, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { CUSTOMER_STATUSES, type CustomerListInput } from "@/lib/customer-schemas";

export type CustomerDoc = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status: (typeof CUSTOMER_STATUSES)[number];
  totalSpent: number;
  ordersCount: number;
  joinedAt: Date;
  updatedAt: Date;
};

export type SerializableCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status: (typeof CUSTOMER_STATUSES)[number];
  totalSpent: number;
  ordersCount: number;
  joinedAt: string;
};

const SORT_WHITELIST: Record<string, 1 | -1> = {
  name: 1,
  email: 1,
  status: 1,
  totalSpent: 1,
  ordersCount: 1,
  joinedAt: 1,
};

export function serializeCustomer(doc: WithId<CustomerDoc>): SerializableCustomer {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    city: doc.city,
    status: doc.status,
    totalSpent: doc.totalSpent,
    ordersCount: doc.ordersCount,
    joinedAt: doc.joinedAt.toISOString(),
  };
}

export async function listCustomers(input: CustomerListInput) {
  const db = getDb();
  const filter: Record<string, unknown> = {};

  if (input.search.trim()) {
    const q = input.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
    ];
  }

  if (input.status && input.status !== "all" && CUSTOMER_STATUSES.includes(input.status as never)) {
    filter.status = input.status;
  }

  const direction = input.sortDirection === "desc" ? -1 : 1;
  const sortField = input.sortField in SORT_WHITELIST ? input.sortField : "name";
  const sort: Sort = { [sortField]: direction as 1 | -1 };
  const page = input.page;
  const pageSize = input.pageSize;

  const [docs, total] = await Promise.all([
    db
      .collection<CustomerDoc>(COLLECTIONS.customers)
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    db.collection<CustomerDoc>(COLLECTIONS.customers).countDocuments(filter),
  ]);

  return {
    items: docs.map(serializeCustomer),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status: CustomerDoc["status"];
}) {
  const db = getDb();
  const email = data.email.toLowerCase();
  const existing = await db
    .collection<CustomerDoc>(COLLECTIONS.customers)
    .findOne({ email });
  if (existing) throw new Error("DUPLICATE_EMAIL");

  const doc: CustomerDoc = {
    name: data.name,
    email,
    phone: data.phone,
    city: data.city,
    status: data.status,
    totalSpent: 0,
    ordersCount: 0,
    joinedAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db
    .collection<CustomerDoc>(COLLECTIONS.customers)
    .insertOne(doc);
  return serializeCustomer({ ...doc, _id: result.insertedId });
}

export async function updateCustomer(
  id: string,
  data: Record<string, unknown>,
) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const existing = await db
    .collection<CustomerDoc>(COLLECTIONS.customers)
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const update: Partial<CustomerDoc> = { updatedAt: new Date() };
  if (data.name !== undefined) update.name = data.name as string;
  if (data.email !== undefined) {
    const email = (data.email as string).toLowerCase();
    if (email !== existing.email) {
      const dup = await db
        .collection<CustomerDoc>(COLLECTIONS.customers)
        .findOne({ email, _id: { $ne: new ObjectId(id) } });
      if (dup) throw new Error("DUPLICATE_EMAIL");
      update.email = email;
    }
  }
  if (data.phone !== undefined) update.phone = data.phone as string | undefined;
  if (data.city !== undefined) update.city = data.city as string | undefined;
  if (data.status !== undefined) update.status = data.status as CustomerDoc["status"];

  const result = await db
    .collection<CustomerDoc>(COLLECTIONS.customers)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );
  return result ? serializeCustomer(result) : null;
}

export async function deleteCustomer(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<CustomerDoc>(COLLECTIONS.customers)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
