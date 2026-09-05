import "server-only";

import { ObjectId, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import type { ProductDoc } from "@/lib/products-repo";

export type CategoryDoc = {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializableCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: string;
};

export function serializeCategory(
  doc: WithId<CategoryDoc>,
  productCount = 0,
): SerializableCategory {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    slug: doc.slug,
    productCount,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCategories(search = "") {
  const db = getDb();

  const filter: Record<string, unknown> = {};
  if (search.trim()) {
    const q = search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const categories = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .find(filter)
    .sort({ name: 1 })
    .toArray();

  const counts = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .aggregate<{ _id: string; count: number }>([
      { $match: { category: { $in: categories.map((c) => c.name) } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();

  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  return categories.map((c) =>
    serializeCategory(c, countMap.get(c.name) ?? 0),
  );
}

export async function categoryExists(name: string) {
  const db = getDb();
  const doc = await db.collection<CategoryDoc>(COLLECTIONS.categories).findOne({ name });
  return Boolean(doc);
}

export async function createCategory(data: { name: string; description?: string }) {
  const db = getDb();
  const name = data.name.trim();
  const slug = slugify(name);

  const existing = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    if (existing.name === name) throw new Error("DUPLICATE_NAME");
    throw new Error("DUPLICATE_SLUG");
  }

  const now = new Date();
  const doc: CategoryDoc = {
    name,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .insertOne(doc);
  return serializeCategory({ ...doc, _id: result.insertedId });
}

export async function updateCategory(
  id: string,
  data: { name?: string },
) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const existing = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const update: Partial<CategoryDoc> = { updatedAt: new Date() };
  if (data.name !== undefined && data.name !== existing.name) {
    const newName = data.name.trim();
    const duplicate = await db
      .collection<CategoryDoc>(COLLECTIONS.categories)
      .findOne({ name: newName, _id: { $ne: new ObjectId(id) } });
    if (duplicate) throw new Error("DUPLICATE_NAME");
    update.name = newName;
    update.slug = slugify(newName);
  }

  const result = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  return result ? serializeCategory(result) : null;
}

export async function deleteCategory(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return "not-found";

  const category = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .findOne({ _id: new ObjectId(id) });
  if (!category) return "not-found";

  const inUse = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOne({ category: category.name });
  if (inUse) return "in-use";

  await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .deleteOne({ _id: new ObjectId(id) });
  return "ok";
}
