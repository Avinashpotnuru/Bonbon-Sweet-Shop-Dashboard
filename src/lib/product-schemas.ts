import { z } from "zod";

export const PRODUCT_STATUSES = ["Active", "Draft", "Out of Stock"] as const;

export const productStatusSchema = z.enum(PRODUCT_STATUSES, {
  message: "Please select a valid status.",
});

export const productCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required.")
    .max(80, "Product name must be 80 characters or fewer."),
  category: z.string().min(1, "Please select a category."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a number.",
    })
    .min(0.01, "Price must be at least $0.01.")
    .max(99999, "Price is too large (max $99,999)."),
  stock: z.coerce
    .number({
      invalid_type_error: "Stock must be a whole number.",
    })
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),
  status: productStatusSchema,
  image: z
    .string()
    .url("Please provide a valid image URL.")
    .optional()
    .or(z.literal("")),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  sku: z
    .string()
    .min(1, "SKU is required.")
    .max(32, "SKU must be 32 characters or fewer.")
    .optional(),
});

export const productListSchema = z.object({
  search: z.string().optional().default(""),
  category: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
  sortField: z
    .enum(["name", "price", "stock", "createdAt"])
    .optional()
    .default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductListInput = z.infer<typeof productListSchema>;
