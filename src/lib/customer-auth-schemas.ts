import { z } from "zod";

export const customerRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be 72 characters or fewer."),
  })
  .strict();

export type AccountPasswordInput = z.infer<typeof accountPasswordSchema>;

export const accountSettingsSchema = z
  .object({
    receivePromotions: z.boolean().optional(),
    orderUpdates: z.boolean().optional(),
  })
  .strict();

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
