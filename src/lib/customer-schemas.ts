import { z } from "zod";

export const CUSTOMER_STATUSES = ["Active", "VIP", "Inactive"] as const;

export const customerStatusSchema = z.enum(CUSTOMER_STATUSES, {
  message: "Please select a valid status.",
});

export const customerCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required.")
    .max(80, "Customer name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address."),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(80, "City must be 80 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: customerStatusSchema,
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerListSchema = z.object({
  search: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  sortField: z
    .enum(["name", "email", "status", "totalSpent", "ordersCount", "joinedAt"])
    .optional()
    .default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerListInput = z.infer<typeof customerListSchema>;
