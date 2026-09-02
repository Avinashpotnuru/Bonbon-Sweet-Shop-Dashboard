import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const client = new MongoClient(env.MONGODB_URI);
await client.connect();
const db = client.db(env.MONGODB_DB || "sweet-shop");

const catCount = await db.collection("categories").countDocuments();
const prodCount = await db.collection("products").countDocuments();
console.log(`categories: ${catCount}, products: ${prodCount}`);

const sample = await db.collection("products").findOne();
console.log("sample product:", JSON.stringify(sample, null, 2));

const cats = await db.collection("categories").find().sort({ name: 1 }).toArray();
console.log("categories:", cats.map((c) => c.name).join(", "));

await client.close();
