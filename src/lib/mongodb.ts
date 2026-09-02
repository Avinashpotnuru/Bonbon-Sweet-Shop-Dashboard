import "server-only";

import { MongoClient, type Db } from "mongodb";

declare global {
  var __mongoClient: MongoClient | undefined;
}

const globalForMongo = globalThis as unknown as {
  __mongoClient: MongoClient | undefined;
};

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to your .env.local file.",
    );
  }
  return uri;
}

function getDbName(): string {
  return process.env.MONGODB_DB ?? "sweet-shop";
}

function getClient(): MongoClient {
  if (!globalForMongo.__mongoClient) {
    globalForMongo.__mongoClient = new MongoClient(getUri());
  }
  return globalForMongo.__mongoClient;
}

export function getDb(): Db {
  return getClient().db(getDbName());
}

export async function connectDb(): Promise<MongoClient> {
  const client = getClient();
  try {
    await client.db(getDbName()).command({ ping: 1 });
  } catch {
    await client.connect();
  }
  return client;
}

export const COLLECTIONS = {
  products: "products",
  categories: "categories",
  customers: "customers",
  orders: "orders",
  expenses: "expenses",
  inventoryMovements: "inventory_movements",
} as const;
