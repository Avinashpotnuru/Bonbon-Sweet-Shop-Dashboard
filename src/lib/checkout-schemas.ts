import { z } from "zod";

export const PAYMENT_METHODS = ["Cash on Delivery", "Razorpay", "PayPal"] as const;

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Please enter your full name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20, "Phone number must be 20 characters or fewer.")
    .regex(/^[+\d][\d\s().-]*$/, "Please enter a valid phone number."),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Please enter your street address.")
    .max(120, "Address must be 120 characters or fewer."),
  addressLine2: z
    .string()
    .trim()
    .max(120, "Address must be 120 characters or fewer.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(1, "Please enter your city.")
    .max(80, "City must be 80 characters or fewer."),
  state: z
    .string()
    .trim()
    .max(80, "State must be 80 characters or fewer.")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .min(1, "Please enter your postal code.")
    .max(12, "Postal code must be 12 characters or fewer."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "Please select a payment method.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
