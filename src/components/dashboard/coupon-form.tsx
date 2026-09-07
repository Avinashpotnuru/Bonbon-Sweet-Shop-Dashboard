"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Coupon } from "@/lib/coupon-types";

const couponFormSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9][A-Z0-9_-]{1,31}$/,
      "Use 2–32 letters, numbers, underscores or dashes.",
    ),
  label: z
    .string()
    .trim()
    .min(1, "Label is required.")
    .max(60, "Label must be 60 characters or fewer."),
  percent: z.coerce
    .number()
    .min(1, "Discount must be between 1% and 100%.")
    .max(100, "Discount must be between 1% and 100%."),
  expiresAt: z.string(),
  maxUses: z.string(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;

export function CouponForm({
  open,
  onOpenChange,
  coupon,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
  onSubmit: (values: CouponFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      label: coupon?.label ?? "",
      percent: coupon?.percent ?? 10,
      expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      maxUses: coupon?.maxUses != null ? String(coupon.maxUses) : "",
    },
  });

  function onDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          <DialogDescription>
            {coupon
              ? `Update the details for ${coupon.code}.`
              : "Create a new promo code for customers."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="coupon-code" required>Code</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-code"
                  placeholder="e.g. SUMMER25"
                  {...register("code")}
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? "coupon-code-error" : undefined}
                />
                {errors.code && (
                  <FieldError id="coupon-code-error" errors={[{ message: errors.code.message }]} />
                )}
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="coupon-label" required>Label</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-label"
                  placeholder="e.g. Summer sale"
                  {...register("label")}
                  aria-invalid={!!errors.label}
                  aria-describedby={errors.label ? "coupon-label-error" : undefined}
                />
                {errors.label && (
                  <FieldError id="coupon-label-error" errors={[{ message: errors.label.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="coupon-percent" required>Discount %</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-percent"
                  type="number"
                  min={1}
                  max={100}
                  {...register("percent")}
                  aria-invalid={!!errors.percent}
                  aria-describedby={errors.percent ? "coupon-percent-error" : undefined}
                />
                {errors.percent && (
                  <FieldError id="coupon-percent-error" errors={[{ message: errors.percent.message }]} />
                )}
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="coupon-expires">Expires</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-expires"
                  type="date"
                  {...register("expiresAt")}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="coupon-max-uses">Max uses</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-max-uses"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  {...register("maxUses")}
                />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onDialogOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : coupon ? "Save changes" : "Add Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}