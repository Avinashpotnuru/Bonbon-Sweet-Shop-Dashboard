import "server-only";

import { ObjectId, type WithId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import type { Coupon } from "@/lib/coupon-types";
import type { CouponCreateInput, CouponUpdateInput } from "@/lib/coupon-schemas";

export type CouponDoc = {
  code: string;
  label: string;
  percent: number;
  expiresAt: Date | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeCoupon(doc: WithId<CouponDoc>): Coupon {
  const now = Date.now();
  const expired = doc.expiresAt ? doc.expiresAt.getTime() < now : false;
  const exhausted = doc.maxUses != null && doc.usedCount >= doc.maxUses;
  return {
    id: doc._id.toHexString(),
    code: doc.code,
    label: doc.label,
    percent: doc.percent,
    expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
    maxUses: doc.maxUses,
    usedCount: doc.usedCount,
    active: !expired && !exhausted,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function listCoupons(): Promise<Coupon[]> {
  const db = getDb();
  const docs = await db
    .collection<CouponDoc>(COLLECTIONS.coupons)
    .find({})
    .sort({ createdAt: -1 as const })
    .toArray();
  return docs.map(serializeCoupon);
}

/**
 * Active coupons that can still be redeemed right now (not expired and not
 * exhausted). Used to surface redeemable offers to storefront customers.
 */
export async function listActiveCoupons(): Promise<Coupon[]> {
  const db = getDb();
  const now = new Date();
  const docs = await db
    .collection<CouponDoc>(COLLECTIONS.coupons)
    .find({
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
        { $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }] },
      ],
    })
    .sort({ percent: -1 as const })
    .toArray();
  return docs.map(serializeCoupon);
}

export async function getCouponByCode(
  code: string,
): Promise<WithId<CouponDoc> | null> {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const db = getDb();
  return db.collection<CouponDoc>(COLLECTIONS.coupons).findOne({ code: normalized });
}

/** A coupon that can still be applied at checkout (exists, not expired, uses left). */
export async function getActiveCouponByCode(
  code: string,
): Promise<WithId<CouponDoc> | null> {
  const doc = await getCouponByCode(code);
  if (!doc) return null;
  const now = new Date();
  if (doc.expiresAt && doc.expiresAt < now) return null;
  if (doc.maxUses != null && doc.usedCount >= doc.maxUses) return null;
  return doc;
}

export async function createCoupon(
  data: CouponCreateInput,
): Promise<Coupon | { error: string }> {
  const db = getDb();
  const existing = await getCouponByCode(data.code);
  if (existing) return { error: `A coupon with code ${existing.code} already exists.` };

  const now = new Date();
  const doc: WithId<CouponDoc> = {
    _id: new ObjectId(),
    code: data.code.trim().toUpperCase(),
    label: data.label.trim(),
    percent: data.percent,
    expiresAt: data.expiresAt ?? null,
    maxUses: data.maxUses ?? null,
    usedCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<CouponDoc>(COLLECTIONS.coupons).insertOne(doc);
  return serializeCoupon(doc);
}

export async function updateCoupon(
  id: string,
  data: CouponUpdateInput,
): Promise<Coupon | null | { error: string }> {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;

  const update: Partial<CouponDoc> = { updatedAt: new Date() };
  if (data.code !== undefined) update.code = data.code.trim().toUpperCase();
  if (data.label !== undefined) update.label = data.label.trim();
  if (data.percent !== undefined) update.percent = data.percent;
  if (data.expiresAt !== undefined) update.expiresAt = data.expiresAt ?? null;
  if (data.maxUses !== undefined) update.maxUses = data.maxUses ?? null;

  if (update.code) {
    const existing = await getCouponByCode(update.code);
    if (existing && existing._id.toHexString() !== id) {
      return { error: `A coupon with code ${update.code} already exists.` };
    }
  }

  const result = await db
    .collection<CouponDoc>(COLLECTIONS.coupons)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );
  return result ? serializeCoupon(result) : null;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const db = getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db
    .collection<CouponDoc>(COLLECTIONS.coupons)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function bumpCouponUsage(code: string): Promise<void> {
  const db = getDb();
  await db
    .collection<CouponDoc>(COLLECTIONS.coupons)
    .updateOne({ code }, { $inc: { usedCount: 1 } });
}