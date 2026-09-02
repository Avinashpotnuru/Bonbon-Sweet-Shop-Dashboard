"use client";

import { useMemo } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/lib/inventory-types";

const adjustSchema = z
  .object({
    type: z.enum(["in", "out"], { message: "Select an adjustment type." }),
    change: z.coerce
      .number()
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1.")
      .max(100000, "Quantity is too large."),
    notes: z
      .string()
      .trim()
      .max(200, "Notes must be 200 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => d.change > 0, {
    message: "Quantity must be greater than zero.",
    path: ["change"],
  });

export type AdjustFormValues = z.infer<typeof adjustSchema>;

export function AdjustStockDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem;
  onSubmit: (values: AdjustFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: "in", change: 1, notes: "" },
  });

  const type = useWatch({ control, name: "type" });
  const changeRaw = useWatch({ control, name: "change" });

  const preview = useMemo(() => {
    if (!item) return { value: 0, clamped: false, out: false };
    const magnitude = Number(changeRaw) || 0;
    const signed = type === "in" ? magnitude : -magnitude;
    let next = item.stock + signed;
    let clamped = false;
    if (next < 0) {
      next = 0;
      clamped = true;
    }
    return { value: next, clamped, out: next === 0 };
  }, [item, type, changeRaw]);

  function onDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Update the stock level for{" "}
            <span className="font-medium text-foreground">{item?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Current stock</span>
              <span className="text-lg font-semibold tabular-nums">{item?.stock ?? 0}</span>
            </div>
            <Badge variant={preview.out ? "destructive" : "secondary"}>
              {item?.level}
            </Badge>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">After adjustment</span>
              <span className="text-lg font-semibold tabular-nums">{preview.value}</span>
            </div>
          </div>

          {preview.clamped && (
            <p className="text-sm text-destructive">
              Stock can&apos;t go below zero, so it will be set to 0.
            </p>
          )}

          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                    <SelectTrigger id="type" aria-invalid={!!errors.type}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">
                        <span className="inline-flex items-center gap-2">
                          <ArrowDownToLine className="size-3.5" aria-hidden="true" />
                          Stock in (receive)
                        </span>
                      </SelectItem>
                      <SelectItem value="out">
                        <span className="inline-flex items-center gap-2">
                          <ArrowUpFromLine className="size-3.5" aria-hidden="true" />
                          Stock out (remove)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <FieldError id="type-error" errors={[{ message: errors.type.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="change">Quantity</FieldLabel>
            <FieldContent>
              <Input
                id="change"
                type="number"
                min={1}
                step={1}
                placeholder="1"
                aria-invalid={!!errors.change}
                aria-describedby={errors.change ? "change-error" : undefined}
                {...register("change")}
              />
              {errors.change && (
                <FieldError id="change-error" errors={[{ message: errors.change.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
            <FieldContent>
              <Input
                id="notes"
                placeholder="e.g. Restock from supplier"
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? "notes-error" : undefined}
                {...register("notes")}
              />
              {errors.notes && (
                <FieldError id="notes-error" errors={[{ message: errors.notes.message }]} />
              )}
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Apply adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
