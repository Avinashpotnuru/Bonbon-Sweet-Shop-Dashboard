import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Ingredients",
  "Packaging",
  "Marketing",
  "Equipment",
  "Salaries",
  "Other",
] as const;

export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES, {
  message: "Please select a category.",
});

export const expenseCreateSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(120, "Description must be 120 characters or fewer."),
  category: expenseCategorySchema,
  amount: z.coerce
    .number()
    .min(0.01, "Amount must be at least 0.01.")
    .max(1000000, "Amount must be 1,000,000 or less."),
  date: z.coerce.date({ message: "Please provide a valid date." }),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseListSchema = z.object({
  search: z.string().optional().default(""),
  category: z.string().optional().default("all"),
  sortField: z
    .enum(["description", "category", "amount", "date"])
    .optional()
    .default("date"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export type ExpenseListInput = z.infer<typeof expenseListSchema>;
