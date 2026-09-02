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

const CUSTOMERS = [
  ["Emma Wilson", "emma.wilson@example.com", "(555) 101-2345", "Portland", "VIP", 1240.5, 23, "2023-11-02"],
  ["Marcus Reed", "marcus.reed@example.com", "(555) 202-3456", "Seattle", "Active", 486.75, 9, "2024-01-18"],
  ["Priya Nair", "priya.nair@example.com", "(555) 303-4567", "San Francisco", "Active", 812.2, 15, "2024-02-07"],
  ["Tomas Rivera", "tomas.rivera@example.com", "(555) 404-5678", "Austin", "Inactive", 132.0, 2, "2023-07-22"],
  ["Hannah Kim", "hannah.kim@example.com", "(555) 505-6789", "Los Angeles", "VIP", 1970.0, 34, "2023-05-11"],
  ["Derek Okafor", "derek.okafor@example.com", "(555) 606-7890", "Chicago", "Active", 354.4, 7, "2024-03-03"],
  ["Sofia Marchetti", "sofia.marchetti@example.com", "(555) 707-8901", "New York", "Active", 596.1, 12, "2024-01-29"],
  ["James Holt", "james.holt@example.com", "(555) 808-9012", "Denver", "Inactive", 78.99, 1, "2023-12-15"],
  ["Aisha Bello", "aisha.bello@example.com", "(555) 909-0123", "Phoenix", "Active", 623.8, 11, "2024-04-02"],
  ["Liam O'Brien", "liam.obrien@example.com", "(555) 111-2233", "Dublin", "VIP", 1485.0, 26, "2023-09-30"],
  ["Grace Zhang", "grace.zhang@example.com", "(555) 222-3344", "Toronto", "Active", 268.0, 5, "2024-05-14"],
  ["Noah Fischer", "noah.fischer@example.com", "(555) 333-4455", "Berlin", "Inactive", 45.5, 1, "2023-08-08"],
  ["Isabelle Moreau", "isabelle.moreau@example.com", "(555) 444-5566", "Paris", "Active", 412.75, 8, "2024-03-21"],
  ["Arjun Patel", "arjun.patel@example.com", "(555) 555-6677", "Mumbai", "Active", 720.25, 14, "2024-02-19"],
  ["Mia Nguyen", "mia.nguyen@example.com", "(555) 666-7788", "Sydney", "VIP", 1620.4, 29, "2023-10-05"],
  ["Leo Costa", "leo.costa@example.com", "(555) 777-8899", "Lisbon", "Active", 304.6, 6, "2024-06-10"],
];

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
  const col = db.collection("customers");

  await col.deleteMany({});

  const docs = CUSTOMERS.map(
    ([name, email, phone, city, status, totalSpent, ordersCount, joinedAt]) => ({
      name,
      email,
      phone,
      city,
      status,
      totalSpent,
      ordersCount,
      joinedAt: new Date(joinedAt),
      updatedAt: new Date(joinedAt),
    }),
  );
  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} customers`);

  await col.createIndex({ email: 1 }, { unique: true });
  await col.createIndex({ name: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ totalSpent: 1 });
  await col.createIndex({ ordersCount: 1 });
  await col.createIndex({ joinedAt: 1 });

  console.log("Indexes created");
  await client.close();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
