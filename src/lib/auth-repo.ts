import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { ObjectId, type WithId } from "mongodb";

import { getDb } from "./mongodb";
import type { PublicUser, Role, User, UserStatus } from "./auth-types";

const SALT_LEN = 16;
const KEY_LEN = 64;

const scryptAsync = promisify(scrypt);

export type UserDoc = {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: Role;
  status?: UserStatus;
  createdAt: string;
  updatedAt?: string;
};

function toPublicUser(doc: WithId<UserDoc>): PublicUser {
  const { _id, status, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id.toHexString(),
    status: status ?? "active",
    updatedAt,
  };
}

function toUser(doc: WithId<UserDoc>): User {
  const { _id, status, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id.toHexString(),
    status: status ?? "active",
    updatedAt,
  };
}

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
  return user && user._id ? toUser(user) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (!ObjectId.isValid(id)) return null;
  const user = await getDb()
    .collection<UserDoc>("users")
    .findOne({ _id: new ObjectId(id) });
  return user && user._id ? toUser(user) : null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  status?: UserStatus;
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
    status: input.status ?? "active",
    createdAt: now,
  };
  if (input.phone?.trim()) {
    doc.phone = input.phone.trim();
  }

  const result = await getDb().collection<UserDoc>("users").insertOne(doc);
  return toPublicUser({ ...doc, _id: result.insertedId });
}

/** Manager + staff accounts, newest-looking first by name. */
export async function listStaffUsers(): Promise<PublicUser[]> {
  const docs = await getDb()
    .collection<UserDoc>("users")
    .find({ role: { $in: ["manager", "staff"] } })
    .sort({ name: 1 })
    .toArray();
  return docs.map(toPublicUser);
}

export type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
  password?: string;
};

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) return null;

  const existing = await getDb()
    .collection<UserDoc>("users")
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const update: Partial<UserDoc> = { updatedAt: new Date().toISOString() };

  if (input.name !== undefined) {
    update.name = input.name.trim();
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    if (email !== existing.email) {
      const dup = await getDb().collection<UserDoc>("users").findOne({ email });
      if (dup) throw new Error("DUPLICATE_EMAIL");
      update.email = email;
    }
  }

  if (input.phone !== undefined) {
    update.phone = input.phone.trim() || undefined;
  }

  if (input.role !== undefined) {
    update.role = input.role;
  }

  if (input.status !== undefined) {
    update.status = input.status;
  }

  if (input.password) {
    update.passwordHash = await hashPassword(input.password);
  }

  const result = await getDb()
    .collection<UserDoc>("users")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  return result ? toPublicUser(result) : null;
}