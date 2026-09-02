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

const CATEGORIES = [
  "Premium Chocolates",
  "Caramels",
  "Hard Candy",
  "Gummies",
  "International",
  "Natural",
  "Lollipops",
  "Mints",
];

const PRODUCTS = [
  ["Belgian Truffle Collection", "BTC-001", "Premium Chocolates", 34.99, 3, "Active", "2024-01-15"],
  ["Salted Caramel Bonbons", "SCB-010", "Caramels", 22.5, 48, "Active", "2024-02-03"],
  ["Japanese Matcha Kit Kats", "JMK-008", "International", 18, 7, "Active", "2024-01-20"],
  ["Rock Candy Sticks", "RCS-022", "Hard Candy", 6.99, 4, "Active", "2024-03-11"],
  ["Organic Honey Drops", "OHD-005", "Natural", 12, 2, "Active", "2024-02-28"],
  ["Rainbow Gummy Bears", "RGB-015", "Gummies", 8.99, 120, "Active", "2024-01-10"],
  ["Dark Chocolate Truffles", "DCT-003", "Premium Chocolates", 42, 0, "Out of Stock", "2024-01-05"],
  ["Butter Toffee Squares", "BTS-012", "Caramels", 15.75, 64, "Active", "2024-02-14"],
  ["Swedish Fish", "SFW-020", "Gummies", 5.49, 200, "Active", "2024-03-01"],
  ["Peppermint Bark", "PMB-007", "Mints", 28, 15, "Active", "2024-01-25"],
  ["Fruit Lollipop Assortment", "FLA-018", "Lollipops", 9.99, 85, "Active", "2024-02-20"],
  ["Turkish Delight Rose", "TDR-009", "International", 24, 12, "Active", "2024-03-05"],
  ["Spearmint Leaves", "SPL-016", "Mints", 4.99, 150, "Active", "2024-01-30"],
  ["Artisan Caramels Box", "ACB-014", "Caramels", 19.5, 5, "Active", "2024-02-10"],
  ["Sour Worms", "SRW-021", "Gummies", 7.99, 0, "Out of Stock", "2024-03-08"],
  ["Milk Chocolate Bars", "MCB-002", "Premium Chocolates", 14.99, 92, "Active", "2024-01-12"],
  ["Honey Lavender Drops", "HLD-006", "Natural", 11, 30, "Active", "2024-02-22"],
  ["Pineapple Gummies", "PNG-017", "Gummies", 6.49, 75, "Active", "2024-03-12"],
  ["Ribbon Candy Holiday", "RCH-025", "Hard Candy", 16, 0, "Draft", "2024-04-01"],
  ["Strawberry Bonbons", "STB-011", "Caramels", 21, 38, "Active", "2024-02-18"],
  ["Italian Licorice", "ITL-019", "International", 13.5, 22, "Active", "2024-03-15"],
  ["Cinnamon Hard Drops", "CHD-023", "Hard Candy", 5.99, 110, "Active", "2024-01-18"],
  ["Rose Turkish Delight", "RTD-026", "International", 26, 8, "Draft", "2024-04-05"],
  ["Chocolate Lollipop Set", "CLS-024", "Lollipops", 17.5, 42, "Active", "2024-02-25"],
  ["Eucalyptus Drops", "EUD-027", "Mints", 8.5, 60, "Active", "2024-03-20"],
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  const categoriesCol = db.collection("categories");
  const productsCol = db.collection("products");

  await categoriesCol.deleteMany({});
  await productsCol.deleteMany({});

  const categoryDocs = CATEGORIES.map((name) => ({
    name,
    slug: slugify(name),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await categoriesCol.insertMany(categoryDocs);
  console.log(`Seeded ${categoryDocs.length} categories`);

  const productDocs = PRODUCTS.map(([name, sku, category, price, stock, status, createdAt]) => ({
    sku,
    name,
    category,
    price,
    stock,
    status,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
  }));
  await productsCol.insertMany(productDocs);
  console.log(`Seeded ${productDocs.length} products`);

  await productsCol.createIndex({ sku: 1 }, { unique: true });
  await productsCol.createIndex({ name: 1 });
  await productsCol.createIndex({ category: 1 });
  await productsCol.createIndex({ status: 1 });
  await productsCol.createIndex({ createdAt: 1 });

  console.log("Indexes created");
  await client.close();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
