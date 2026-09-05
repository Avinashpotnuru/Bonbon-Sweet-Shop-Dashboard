"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { saveAddressAction } from "@/components/store/account-actions";

const schema = z.object({
  label: z.string().trim().min(1, "Label is required.").max(40),
  line1: z.string().trim().min(1, "Street address is required.").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required.").max(80),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export function AddressForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    },
  });

  async function onSubmit(values: Values) {
    const res = await saveAddressAction({ ...values, isDefault });
    if (!res.ok) {
      toast.error(res.error ?? "Could not save address.");
      return;
    }
    toast.success("Address saved.");
    reset();
    setIsDefault(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button type="button" className="rounded-xl" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        Add address
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="addr-label">Label</FieldLabel>
        <FieldContent>
          <Input
            id="addr-label"
            placeholder="e.g. Home"
            aria-invalid={!!errors.label}
            {...register("label")}
          />
          {errors.label && <FieldError errors={[{ message: errors.label.message }]} />}
        </FieldContent>
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="addr-line1">Street address</FieldLabel>
        <FieldContent>
          <Input
            id="addr-line1"
            placeholder="123 Main St"
            autoComplete="address-line1"
            aria-invalid={!!errors.line1}
            {...register("line1")}
          />
          {errors.line1 && <FieldError errors={[{ message: errors.line1.message }]} />}
        </FieldContent>
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="addr-line2">Apartment, suite, etc. (optional)</FieldLabel>
        <FieldContent>
          <Input id="addr-line2" autoComplete="address-line2" {...register("line2")} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="addr-city">City</FieldLabel>
        <FieldContent>
          <Input
            id="addr-city"
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          {errors.city && <FieldError errors={[{ message: errors.city.message }]} />}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="addr-state">State / region (optional)</FieldLabel>
        <FieldContent>
          <Input id="addr-state" autoComplete="address-level1" {...register("state")} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="addr-postal">Postal code</FieldLabel>
        <FieldContent>
          <Input
            id="addr-postal"
            autoComplete="postal-code"
            aria-invalid={!!errors.postalCode}
            {...register("postalCode")}
          />
          {errors.postalCode && (
            <FieldError errors={[{ message: errors.postalCode.message }]} />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="addr-phone">Phone (optional)</FieldLabel>
        <FieldContent>
          <Input id="addr-phone" autoComplete="tel" {...register("phone")} />
        </FieldContent>
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="size-4 accent-[oklch(0.6_0.15_60)]"
        />
        Set as default address
      </label>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Save address
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          className="rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
