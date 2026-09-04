import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  const env = {};
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found. Create it from the credentials provided.");
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const INDEXES = {
  products: [
    { key: { name: 1 }, name: "products_name_1" },
    { key: { sku: 1 }, name: "products_sku_1", unique: true },
    { key: { category: 1, status: 1 }, name: "products_category_status" },
    { key: { stock: 1 }, name: "products_stock_1" },
    { key: { createdAt: -1 }, name: "products_createdAt_-1" },
  ],
  categories: [
    { key: { name: 1 }, name: "categories_name_1" },
    { key: { slug: 1 }, name: "categories_slug_1", unique: true },
  ],
  orders: [
    { key: { placedAt: -1 }, name: "orders_placedAt_-1" },
    { key: { status: 1, placedAt: -1 }, name: "orders_status_placedAt" },
    { key: { orderNumber: 1 }, name: "orders_orderNumber_1" },
    { key: { customerName: 1 }, name: "orders_customerName_1" },
  ],
  customers: [
    { key: { name: 1 }, name: "customers_name_1" },
    { key: { email: 1 }, name: "customers_email_1", unique: true },
    { key: { status: 1, name: 1 }, name: "customers_status_name" },
    { key: { totalSpent: -1 }, name: "customers_totalSpent_-1" },
  ],
  expenses: [
    { key: { date: -1 }, name: "expenses_date_-1" },
    { key: { category: 1, date: -1 }, name: "expenses_category_date" },
  ],
  inventoryMovements: [
    { key: { productId: 1, createdAt: -1 }, name: "inv_movements_product_created" },
  ],
  users: [{ key: { email: 1 }, name: "users_email_1", unique: true }],
};

async function main() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;
  const dbName = env.MONGODB_DB || "sweet-shop";

  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.local");
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    for (const [collection, indexes] of Object.entries(INDEXES)) {
      try {
        await db.createCollection(collection);
      } catch {
        // collection already exists — ignore
      }
      const col = db.collection(collection);
      const existing = await col.indexes();
      const existingKeys = new Map(
        existing.map((idx) => [JSON.stringify(idx.key), idx.name]),
      );
      for (const spec of indexes) {
        const keyStr = JSON.stringify(spec.key);
        if (existingKeys.has(keyStr)) {
          console.log(
            `[ensure-indexes] ${collection}: ${spec.name} already exists as "${existingKeys.get(keyStr)}" (skipping)`,
          );
          continue;
        }
        await col.createIndex(spec.key, {
          name: spec.name,
          unique: spec.unique ?? false,
        });
      }
      console.log(`[ensure-indexes] ${collection}: ${indexes.map((i) => i.name).join(", ")}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("[ensure-indexes] failed:", err);
  process.exit(1);
});
