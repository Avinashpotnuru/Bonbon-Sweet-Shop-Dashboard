import { z } from "zod";

export const inventoryListSchema = z.object({
  search: z.string().optional().default(""),
  level: z
    .enum(["all", "in", "low", "out"])
    .optional()
    .default("all"),
  sortField: z
    .enum(["name", "sku", "category", "price", "stock"])
    .optional()
    .default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export const stockAdjustSchema = z
  .object({
    change: z.coerce
      .number()
      .int("Change must be a whole number.")
      .min(-100000, "Change is too large.")
      .max(100000, "Change is too large."),
    type: z.enum(["in", "out"], {
      message: "Select whether this is an adjustment in or out.",
    }),
    notes: z
      .string()
      .trim()
      .max(200, "Notes must be 200 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => d.change !== 0, {
    message: "Change must be a non-zero number.",
    path: ["change"],
  });

export type InventoryListInput = z.infer<typeof inventoryListSchema>;
