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

const CLIENT_OPTIONS = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  retryReads: true,
  retryWrites: true,
} as const;

function createClient(): MongoClient {
  return new MongoClient(getUri(), CLIENT_OPTIONS);
}

/** Driver keeps the topology out of the public type surface — cast once here. */
function isTopologyDestroyed(client: MongoClient): boolean {
  const topology = (client as unknown as {
    topology?: { isDestroyed?: () => boolean };
  }).topology;
  return Boolean(topology?.isDestroyed?.());
}

function getClient(): MongoClient {
  const cached = globalForMongo.__mongoClient;

  // A topology that has already been closed (dropped connection, driver
  // shutdown, dev-server reload) can never be reused — every operation on it
  // throws MongoTopologyClosedError. Discard it and build a fresh client.
  if (cached && isTopologyDestroyed(cached)) {
    globalForMongo.__mongoClient = undefined;
  }

  if (!globalForMongo.__mongoClient) {
    globalForMongo.__mongoClient = createClient();
  }
  return globalForMongo.__mongoClient;
}

export function getDb(): Db {
  return getClient().db(getDbName());
}

export async function connectDb(): Promise<MongoClient> {
  const client = getClient();
  try {
    await client.connect();
    return client;
  } catch {
    // The failed client may be unrecoverable — discard it and retry once.
    globalForMongo.__mongoClient = undefined;
    const fresh = createClient();
    globalForMongo.__mongoClient = fresh;
    await fresh.connect();
    return fresh;
  }
}

export const COLLECTIONS = {
  products: "products",
  categories: "categories",
  customers: "customers",
  orders: "orders",
  expenses: "expenses",
  inventoryMovements: "inventory_movements",
  users: "users",
  customerProfiles: "customer_profiles",
} as const;
