import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { ObjectId } from "mongodb";

import { getDb, retryableWrite } from "./mongodb";
import type { PublicUser, Role, User } from "./auth-types";

const SALT_LEN = 16;
const KEY_LEN = 64;

const scryptAsync = promisify(scrypt);

export type UserDoc = {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: string;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const hash = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await getDb().collection<UserDoc>("users").findOne({ email });
  if (!user || !user._id) return null;
  const { _id, ...rest } = user;
  return { ...rest, id: _id.toHexString() };
}

export async function findUserById(id: string): Promise<User | null> {
  if (!ObjectId.isValid(id)) return null;
  const user = await getDb()
    .collection<UserDoc>("users")
    .findOne({ _id: new ObjectId(id) });
  if (!user || !user._id) return null;
  const { _id, ...rest } = user;
  return { ...rest, id: _id.toHexString() };
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("DUPLICATE_EMAIL");
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();
  const doc: UserDoc = {
    email,
    passwordHash,
    name: input.name.trim(),
    role: input.role,
    createdAt: now,
  };
  if (input.phone?.trim()) {
    doc.phone = input.phone.trim();
  }
  const result = await retryableWrite(() =>
    getDb().collection<UserDoc>("users").insertOne(doc),
  );

  return {
    id: result.insertedId.toHexString(),
    email,
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    role: input.role,
    createdAt: now,
  };
}
