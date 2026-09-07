import { z } from "zod";

const nullableInt = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce
    .number()
    .int("Max uses must be a whole number.")
    .min(1, "Max uses must be at least 1.")
    .nullable(),
);

const nullableDate = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce
    .date({ message: "Please provide a valid expiry date." })
    .nullable(),
);

export const couponCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9][A-Z0-9_-]{1,31}$/,
      "Use 2–32 letters, numbers, underscores or dashes.",
    ),
  label: z
    .string()
    .trim()
    .min(1, "Label is required.")
    .max(60, "Label must be 60 characters or fewer."),
  percent: z.coerce
    .number()
    .min(1, "Discount must be between 1% and 100%.")
    .max(100, "Discount must be between 1% and 100%."),
  expiresAt: nullableDate,
  maxUses: nullableInt,
});

export type CouponCreateInput = z.infer<typeof couponCreateSchema>;

export const couponUpdateSchema = couponCreateSchema.partial();
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;