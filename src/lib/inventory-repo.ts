import "server-only";

import { ObjectId, type Sort, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import type { ProductDoc } from "@/lib/products-repo";
import type { InventoryListInput } from "@/lib/inventory-schemas";
import {
  type InventoryItem,
  type InventorySummary,
  type StockLevel,
  type StockMovementItem,
} from "@/lib/inventory-types";

export type MovementDoc = {
  productId: string;
  sku: string;
  productName: string;
  type: "in" | "out";
  change: number;
  notes?: string;
  createdAt: Date;
};

const SORT_WHITELIST: Record<string, 1 | -1> = {
  name: 1,
  sku: 1,
  category: 1,
  price: 1,
  stock: 1,
};

function toLevel(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= 10) return "low";
  return "in";
}

export function serializeInventoryItem(doc: WithId<ProductDoc>): InventoryItem {
  return {
    id: doc._id.toHexString(),
    sku: doc.sku,
    name: doc.name,
    category: doc.category,
    price: doc.price,
    stock: doc.stock,
    level: toLevel(doc.stock),
  };
}

export async function listInventory(input: InventoryListInput) {
  const db = getDb();
  const filter: Record<string, unknown> = {};

  if (input.search.trim()) {
    const q = input.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
    ];
  }

  const isAllOrIn = input.level === "all" || input.level === "in";
  if (!isAllOrIn) {
    if (input.level === "out") {
      filter.stock = { $lte: 0 };
    } else {
      filter.stock = { $gt: 0, $lte: 10 };
    }
  }

  const direction = input.sortDirection === "desc" ? -1 : 1;
  const sortField = input.sortField in SORT_WHITELIST ? input.sortField : "name";
  const sort: Sort = { [sortField]: direction as 1 | -1 };
  const page = input.page;
  const pageSize = input.pageSize;

  const filterForList = { ...filter };
  if (input.level === "in") {
    filterForList.stock = { $gt: 10 };
  }

  const [docs, total, agg] = await Promise.all([
    db
      .collection<ProductDoc>(COLLECTIONS.products)
      .find(filterForList)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    db.collection<ProductDoc>(COLLECTIONS.products).countDocuments(filterForList),
    db
      .collection<ProductDoc>(COLLECTIONS.products)
      .aggregate<{
        productCount: number;
        totalUnits: number;
        totalValue: number;
        lowCount: number;
        outCount: number;
      }>([
        {
          $group: {
            _id: null,
            productCount: { $sum: 1 },
            totalUnits: { $sum: "$stock" },
            totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
            lowCount: {
              $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] }, 1, 0] },
            },
            outCount: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
  ]);

  const a = agg[0] ?? {
    productCount: 0,
    totalUnits: 0,
    totalValue: 0,
    lowCount: 0,
    outCount: 0,
  };
  const summary: InventorySummary = {
    productCount: a.productCount,
    totalUnits: a.totalUnits,
    totalValue: a.totalValue,
    lowCount: a.lowCount,
    outCount: a.outCount,
  };

  return {
    items: docs.map(serializeInventoryItem),
    summary,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function adjustStock(id: string, data: {
  type: "in" | "out";
  change: number;
  notes?: string;
}): Promise<{ item: InventoryItem; appliedChange: number; clamped: boolean } | null> {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const product = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .findOne({ _id: new ObjectId(id) });
  if (!product) return null;

  const magnitude = Math.abs(data.change);
  const signed = data.type === "in" ? magnitude : -magnitude;
  let nextStock = product.stock + signed;
  let clamped = false;
  if (nextStock < 0) {
    nextStock = 0;
    clamped = true;
  }

  const nextStatus = nextStock === 0 ? "Out of Stock" : "Active";

  await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { stock: nextStock, status: nextStatus, updatedAt: new Date() } },
    );

  const appliedChange = nextStock - product.stock;

  await db.collection<MovementDoc>(COLLECTIONS.inventoryMovements).insertOne({
    productId: id,
    sku: product.sku,
    productName: product.name,
    type: data.type,
    change: appliedChange,
    notes: data.notes,
    createdAt: new Date(),
  });

  const updatedDoc: WithId<ProductDoc> = {
    ...product,
    stock: nextStock,
    status: nextStatus as ProductDoc["status"],
  };

  return {
    item: serializeInventoryItem(updatedDoc),
    appliedChange,
    clamped,
  };
}

export async function listRecentMovements(limit = 6) {
  const db = getDb();
  const docs = await db
    .collection<MovementDoc>(COLLECTIONS.inventoryMovements)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const items: StockMovementItem[] = docs.map((d) => ({
    id: d._id.toHexString(),
    sku: d.sku,
    productName: d.productName,
    type: d.type,
    change: d.change,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
  }));
  return items;
}
