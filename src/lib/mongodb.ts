import "server-only";

import { MongoClient, MongoServerError, type Db } from "mongodb";

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

/**
 * Retryable-write codes from the driver/server spec: not primary, node
 * recovering, shutdown in progress, stale epoch/config, etc. These are all
 * safe to retry — the write was never applied.
 */
const RETRYABLE_WRITE_CODES = new Set([10107, 11600, 11602, 13435, 13436, 189, 91]);

function isRetryableWriteError(error: unknown): boolean {
  if (error instanceof MongoServerError) {
    const labels = error.errorLabels ?? [];
    if (labels.includes("RetryableWriteError")) return true;
    return RETRYABLE_WRITE_CODES.has(Number(error.code ?? -1));
  }
  return false;
}

/**
 * Runs a write operation, retrying once against a fresh connection when the
 * replica set reports a transient failure like a mid-election primary switch
 * ("not primary"). Drops the cached client so the retry discovers the current
 * primary instead of reusing a stale topology. Non-retryable errors or a
 * genuinely missing primary surface as-is.
 */
export async function retryableWrite<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isRetryableWriteError(error)) throw error;
    globalForMongo.__mongoClient = undefined;
    await new Promise((resolve) => setTimeout(resolve, 250));
    return operation();
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
