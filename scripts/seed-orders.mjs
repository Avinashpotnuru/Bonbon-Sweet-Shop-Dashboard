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

const ORDERS = [
  ["SO-1001", "Emma Wilson", 5, 218.45, "Delivered", "2026-08-28"],
  ["SO-1002", "Marcus Reed", 2, 61.5, "Delivered", "2026-08-29"],
  ["SO-1003", "Priya Nair", 4, 149.0, "Shipped", "2026-08-30"],
  ["SO-1004", "Hannah Kim", 7, 342.75, "Delivered", "2026-08-26"],
  ["SO-1005", "Derek Okafor", 1, 22.5, "Paid", "2026-08-31"],
  ["SO-1006", "Sofia Marchetti", 3, 96.25, "Pending", "2026-09-01"],
  ["SO-1007", "Aisha Bello", 2, 45.98, "Delivered", "2026-08-27"],
  ["SO-1008", "Isabelle Moreau", 4, 187.6, "Shipped", "2026-08-29"],
  ["SO-1009", "Arjun Patel", 1, 12.99, "Cancelled", "2026-08-25"],
  ["SO-1010", "Grace Zhang", 2, 74.5, "Delivered", "2026-08-30"],
  ["SO-1011", "Mia Nguyen", 6, 289.9, "Paid", "2026-08-31"],
  ["SO-1012", "Emma Wilson", 3, 118.75, "Delivered", "2026-08-24"],
  ["SO-1013", "Liam O'Brien", 2, 63.0, "Shipped", "2026-09-01"],
  ["SO-1014", "Tomas Rivera", 1, 42.0, "Delivered", "2026-08-22"],
  ["SO-1015", "Priya Nair", 5, 205.4, "Delivered", "2026-08-28"],
  ["SO-1016", "Hannah Kim", 4, 178.25, "Pending", "2026-09-02"],
  ["SO-1017", "James Holt", 2, 58.99, "Delivered", "2026-08-21"],
  ["SO-1018", "Noah Fischer", 1, 24.99, "Cancelled", "2026-08-19"],
  ["SO-1019", "Leo Costa", 3, 112.3, "Paid", "2026-08-30"],
  ["SO-1020", "Sophia Lee", 2, 86.0, "Delivered", "2026-08-27"],
];

const STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

async function main() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;
  const dbName = env.MONGODB_DB || "sweet-shop";

  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.local");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("orders");

  await col.deleteMany({});

  const docs = ORDERS.map(
    ([orderNumber, customerName, itemCount, total, status, placedAt]) => ({
      orderNumber,
      customerName,
      itemCount,
      total,
      status,
      placedAt: new Date(`${placedAt}T00:00:00Z`),
      updatedAt: new Date(`${placedAt}T00:00:00Z`),
    }),
  );
  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} orders`);

  const validStatuses = STATUSES.filter((s) => !docs.some((d) => d.status === s));
  console.log(`Order statuses represented: ${docs.length - validStatuses.length}/${STATUSES.length}`);

  await col.createIndex({ orderNumber: 1 }, { unique: true });
  await col.createIndex({ customerName: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ total: 1 });
  await col.createIndex({ placedAt: 1 });

  console.log("Indexes created");
  await client.close();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
