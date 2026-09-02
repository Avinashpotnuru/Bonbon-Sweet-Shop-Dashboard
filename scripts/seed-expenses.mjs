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

const EXPENSES = [
  ["Shop rent - August", "Rent", 1800.0, "2026-08-01"],
  ["Electricity & water", "Utilities", 240.75, "2026-08-12"],
  ["Organic sugar supplier", "Ingredients", 465.0, "2026-08-05"],
  ["Gift boxes & tissue", "Packaging", 128.5, "2026-08-08"],
  ["Instagram ad campaign", "Marketing", 300.0, "2026-08-15"],
  ["New candy display case", "Equipment", 650.0, "2026-08-09"],
  ["Part-time sales staff", "Salaries", 1120.0, "2026-08-30"],
  ["Cleaning supplies", "Other", 45.99, "2026-08-20"],
  ["Shop rent - September", "Rent", 1800.0, "2026-09-01"],
  ["Chocolate supplier batch", "Ingredients", 890.25, "2026-08-22"],
  ["Regal shelves refit", "Equipment", 420.0, "2026-08-27"],
  ["Weekly social media boost", "Marketing", 150.0, "2026-08-25"],
  ["POS transaction fees", "Other", 86.4, "2026-08-31"],
  ["Freezer maintenance", "Equipment", 210.0, "2026-08-18"],
  ["Utilities - September", "Utilities", 235.1, "2026-09-02"],
  ["Protein bar ingredients", "Ingredients", 305.75, "2026-08-28"],
  ["Recyclable bags", "Packaging", 92.0, "2026-08-29"],
  ["Staff wages - September", "Salaries", 1185.0, "2026-09-02"],
  ["Window signage", "Marketing", 135.0, "2026-08-21"],
  ["Rainy day fund - misc", "Other", 60.0, "2026-08-24"],
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
  const col = db.collection("expenses");

  await col.deleteMany({});

  const docs = EXPENSES.map(([description, category, amount, date]) => ({
    description,
    category,
    amount,
    date: new Date(`${date}T00:00:00Z`),
    updatedAt: new Date(`${date}T00:00:00Z`),
  }));
  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} expenses`);

  await col.createIndex({ description: 1 });
  await col.createIndex({ category: 1 });
  await col.createIndex({ amount: 1 });
  await col.createIndex({ date: 1 });

  console.log("Indexes created");
  await client.close();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
