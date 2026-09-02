import "server-only";

import {
  ObjectId,
  type Filter,
  type Sort,
  type WithId,
} from "mongodb";

import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { PRODUCT_STATUSES, type ProductListInput } from "@/lib/product-schemas";

export type ProductDoc = {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: (typeof PRODUCT_STATUSES)[number];
  category: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializableProduct = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: (typeof PRODUCT_STATUSES)[number];
  category: string;
  image?: string;
  createdAt: string;
};

const SORT_WHITELIST: Record<string, 1 | -1> = {
  name: 1,
  price: 1,
  stock: 1,
  createdAt: 1,
};

export function serializeProduct(doc: WithId<ProductDoc>): SerializableProduct {
  return {
    id: doc._id.toHexString(),
    sku: doc.sku,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    stock: doc.stock,
    status: doc.status,
    category: doc.category,
    image: doc.image,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function fetchProducts(input: ProductListInput) {
  const db = getDb();
  const filter: Filter<ProductDoc> = {};

  if (input.search) {
    const q = input.search.trim();
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }
  }

  if (input.category && input.category !== "all") {
    filter.category = input.category;
  }

  if (input.status && input.status !== "all" && PRODUCT_STATUSES.includes(input.status as never)) {
    filter.status = input.status as ProductDoc["status"];
  }

  const direction = input.sortDirection === "desc" ? -1 : 1;
  const sortField = input.sortField in SORT_WHITELIST ? input.sortField : "name";
  const sort: Sort = { [sortField]: direction as 1 | -1 };

  const page = input.page;
  const pageSize = input.pageSize;

  const [docs, total] = await Promise.all([
    db
      .collection<ProductDoc>(COLLECTIONS.products)
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    db.collection<ProductDoc>(COLLECTIONS.products).countDocuments(filter),
  ]);

  return {
    items: docs.map(serializeProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function fetchProductById(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;
  const doc = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOne({ _id: new ObjectId(id) });
  return doc ? serializeProduct(doc) : null;
}

export async function createProduct(
  data: {
    name: string;
    category: string;
    description?: string;
    price: number;
    stock: number;
    status: ProductDoc["status"];
    image?: string;
  },
  sku: string,
) {
  const db = getDb();
  const now = new Date();
  const doc: ProductDoc = {
    sku,
    name: data.name,
    category: data.category,
    description: data.description,
    price: data.price,
    stock: data.stock,
    status: data.status,
    image: data.image,
    createdAt: now,
    updatedAt: now,
  };

  const existing = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOne({ sku });
  if (existing) {
    throw new Error("DUPLICATE_SKU");
  }

  const result = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .insertOne(doc);

  return serializeProduct({ ...doc, _id: result.insertedId });
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>,
) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const existing = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const update: Partial<ProductDoc> = { updatedAt: new Date() };
  if (data.name !== undefined) update.name = data.name as string;
  if (data.category !== undefined) update.category = data.category as string;
  if (data.description !== undefined) update.description = data.description as string | undefined;
  if (data.price !== undefined) update.price = data.price as number;
  if (data.stock !== undefined) update.stock = data.stock as number;
  if (data.status !== undefined) update.status = data.status as ProductDoc["status"];
  if (data.image !== undefined) update.image = data.image as string | undefined;
  if (data.sku !== undefined) update.sku = data.sku as string;

  const result = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  return result ? serializeProduct(result) : null;
}

export async function deleteProduct(id: string) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function generateSku(name: string, existingCount = -1) {
  const db = getDb();
  const prefix = (name || "PRD")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3) || "PRD";

  let seq: number;
  if (existingCount >= 0) {
    seq = existingCount + 1;
  } else {
    seq = await db.collection<ProductDoc>(COLLECTIONS.products).countDocuments();
    seq += 1;
  }

  let sku = `${prefix}-${String(seq).padStart(3, "0")}`;
  let exists = await db.collection<ProductDoc>(COLLECTIONS.products).findOne({ sku });
  let guard = 0;
  while (exists && guard < 1000) {
    seq += 1;
    sku = `${prefix}-${String(seq).padStart(3, "0")}`;
    exists = await db.collection<ProductDoc>(COLLECTIONS.products).findOne({ sku });
    guard += 1;
  }
  return sku;
}
