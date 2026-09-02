import { z } from "zod";

export const ORDER_STATUSES = [
  "Pending",
  "Paid",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES, {
  message: "Please select a valid status.",
});

export const orderCreateSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required.")
    .max(80, "Customer name must be 80 characters or fewer."),
  itemCount: z.coerce
    .number()
    .int("Item count must be a whole number.")
    .min(1, "An order must have at least one item."),
  total: z.coerce
    .number()
    .min(0.01, "Total must be at least 0.01.")
    .max(1000000, "Total must be 1,000,000 or less."),
  status: orderStatusSchema,
  placedAt: z.coerce.date({ message: "Please provide a valid date." }),
});

export const orderUpdateSchema = orderCreateSchema.partial();

export const orderListSchema = z.object({
  search: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  sortField: z
    .enum(["orderNumber", "customerName", "itemCount", "total", "status", "placedAt"])
    .optional()
    .default("placedAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderListInput = z.infer<typeof orderListSchema>;
