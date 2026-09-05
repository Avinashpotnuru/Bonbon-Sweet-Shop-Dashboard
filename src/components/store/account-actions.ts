"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { requireCustomerSession } from "@/lib/customer-auth";
import {
  addSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  updateAccountSettings,
  type SavedAddress,
} from "@/lib/customer-repo";
import {
  accountSettingsSchema,
  accountPasswordSchema,
} from "@/lib/customer-auth-schemas";
import { findUserById } from "@/lib/auth-repo";
import { hashPassword, verifyPassword } from "@/lib/auth-repo";
import { getDb } from "@/lib/mongodb";

const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label.").max(40),
  line1: z.string().trim().min(1, "Street address is required.").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required.").max(80),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export async function saveAddressAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string; address?: SavedAddress }> {
  const session = await requireCustomerSession();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }
  const data = parsed.data;
  const address = await addSavedAddress(session.userId, {
    label: data.label,
    line1: data.line1,
    line2: (data.line2 as string) || "",
    city: data.city,
    state: (data.state as string) || "",
    postalCode: data.postalCode,
    phone: (data.phone as string) || "",
    isDefault: !!data.isDefault,
  });
  revalidatePath("/account/addresses");
  return { ok: true, address };
}

export async function removeAddressAction(
  addressId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireCustomerSession();
  await deleteSavedAddress(session.userId, addressId);
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function makeDefaultAddressAction(
  addressId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireCustomerSession();
  await setDefaultAddress(session.userId, addressId);
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateSettingsAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireCustomerSession();
  const parsed = accountSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid settings." };
  }
  await updateAccountSettings(session.userId, parsed.data);
  revalidatePath("/account/settings");
  return { ok: true };
}

export async function changePasswordAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireCustomerSession();
  const parsed = accountPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const user = await findUserById(session.userId);
  if (!user || user.role !== "customer") {
    return { ok: false, error: "Account not found." };
  }
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  const newHash = await hashPassword(parsed.data.newPassword);
  await getDb()
    .collection("users")
    .updateOne({ _id: new ObjectId(user.id) }, { $set: { passwordHash: newHash } });
  return { ok: true };
}
