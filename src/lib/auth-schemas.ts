import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const STAFF_ROLES = ["manager", "staff"] as const;

export const staffCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
  role: z.enum(STAFF_ROLES, { message: "Please select a role." }),
});

export const staffUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer.")
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .optional(),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  role: z.enum(STAFF_ROLES, { message: "Please select a role." }).optional(),
  status: z
    .enum(["active", "inactive"], { message: "Please select a status." })
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(1, "Name is required"),
  role: z.enum(["admin", "manager", "staff"]).default("staff"),
});
