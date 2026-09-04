import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync } from "node:crypto";

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

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;
  const dbName = env.MONGODB_DB || "sweet-shop";

  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.local");
  }

  const email = (env.ADMIN_EMAIL || "admin@bonbon.app").trim().toLowerCase();
  const password = env.ADMIN_PASSWORD || "admin1234";
  const name = env.ADMIN_NAME || "Shop Owner";

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("users");

  const passwordHash = hashPassword(password);
  const existing = await col.findOne({ email });

  if (existing) {
    await col.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, name, role: "admin" } },
    );
    console.log(`[seed-admin] Updated existing admin: ${email}`);
  } else {
    await col.insertOne({
      email,
      passwordHash,
      name,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    console.log(`[seed-admin] Created admin: ${email}`);
  }

  console.log(`[seed-admin] Password set to: ${password}`);
  console.log("[seed-admin] Change it after first login.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
