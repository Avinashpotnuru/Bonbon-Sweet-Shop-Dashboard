"use server";

import { getActiveCouponByCode } from "@/lib/coupon-repo";

export type CouponValidationResult =
  | { ok: true; code: string; label: string; percent: number }
  | { ok: false; message: string };

/** Server-side coupon check used by the cart for its live discount preview. */
export async function validateCoupon(
  input: unknown,
): Promise<CouponValidationResult> {
  const code = typeof input === "string" ? input.trim().toUpperCase() : "";
  if (!code) return { ok: false, message: "Enter a promo code." };

  const doc = await getActiveCouponByCode(code);
  if (!doc) {
    return { ok: false, message: "That promo code is invalid or has expired." };
  }
  return {
    ok: true,
    code: doc.code,
    label: doc.label,
    percent: doc.percent / 100,
  };
}