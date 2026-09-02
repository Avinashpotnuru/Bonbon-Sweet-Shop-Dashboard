import "server-only";

import { ObjectId, type Sort, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { EXPENSE_CATEGORIES, type ExpenseListInput } from "@/lib/expense-schemas";

export type ExpenseDoc = {
  description: string;
  category: (typeof EXPENSE_CATEGORIES)[number];
  amount: number;
  date: Date;
  updatedAt: Date;
};

export type SerializableExpense = {
  id: string;
  description: string;
  category: (typeof EXPENSE_CATEGORIES)[number];
  amount: number;
  date: string;
};

const SORT_WHITELIST: Record<string, 1 | -1> = {
  description: 1,
  category: 1,
  amount: 1,
  date: 1,
};

export function serializeExpense(doc: WithId<ExpenseDoc>): SerializableExpense {
  return {
    id: doc._id.toHexString(),
    description: doc.description,
    category: doc.category,
    amount: doc.amount,
    date: doc.date.toISOString(),
  };
}

export async function listExpenses(input: ExpenseListInput) {
  const db = getDb();
  const filter: Record<string, unknown> = {};

  if (input.search.trim()) {
    const q = input.search.trim();
    filter.$or = [
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  if (input.category && input.category !== "all" && EXPENSE_CATEGORIES.includes(input.category as never)) {
    filter.category = input.category;
  }

  const direction = input.sortDirection === "desc" ? -1 : 1;
  const sortField = input.sortField in SORT_WHITELIST ? input.sortField : "date";
  const sort: Sort = { [sortField]: direction as 1 | -1 };
  const page = input.page;
  const pageSize = input.pageSize;

  const [docs, total, spendAgg] = await Promise.all([
    db
      .collection<ExpenseDoc>(COLLECTIONS.expenses)
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    db.collection<ExpenseDoc>(COLLECTIONS.expenses).countDocuments(filter),
    db
      .collection<ExpenseDoc>(COLLECTIONS.expenses)
      .aggregate<{ total: number }>([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
  ]);

  return {
    items: docs.map(serializeExpense),
    total,
    totalSpend: spendAgg[0]?.total ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createExpense(data: {
  description: string;
  category: ExpenseDoc["category"];
  amount: number;
  date: Date;
}) {
  const db = getDb();
  const doc: ExpenseDoc = {
    description: data.description,
    category: data.category,
    amount: data.amount,
    date: data.date,
    updatedAt: new Date(),
  };

  const result = await db
    .collection<ExpenseDoc>(COLLECTIONS.expenses)
    .insertOne(doc);
  return serializeExpense({ ...doc, _id: result.insertedId });
}

export async function updateExpense(id: string, data: Record<string, unknown>) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const update: Partial<ExpenseDoc> = { updatedAt: new Date() };
  if (data.description !== undefined) update.description = data.description as string;
  if (data.category !== undefined) update.category = data.category as ExpenseDoc["category"];
  if (data.amount !== undefined) update.amount = data.amount as number;
  if (data.date !== undefined) update.date = new Date(data.date as string);

  const result = await db
    .collection<ExpenseDoc>(COLLECTIONS.expenses)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );
  return result ? serializeExpense(result) : null;
}

export async function deleteExpense(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<ExpenseDoc>(COLLECTIONS.expenses)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
