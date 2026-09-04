"use client";

import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES } from "@/lib/order-schemas";
import type { Order, OrderStatus } from "@/lib/orders-types";

const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required.")
    .max(80, "Customer name must be 80 characters or fewer."),
  itemCount: z.coerce
    .number()
    .int("Item count must be a whole number.")
    .min(1, "An order must have at least one item.")
    .max(100000, "Item count is too large."),
  total: z.coerce
    .number()
    .min(0.01, "Total must be at least 0.01.")
    .max(1000000, "Total must be 1,000,000 or less."),
  status: z.enum(ORDER_STATUSES, { message: "Please select a status." }),
  placedAt: z.coerce.date({ message: "Please provide a valid date." }),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

const statusOptions: OrderStatus[] = [...ORDER_STATUSES];

export function OrderForm({
  open,
  onOpenChange,
  order,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order;
  onSubmit: (values: OrderFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: order?.customerName ?? "",
      itemCount: order?.itemCount ?? 1,
      total: order?.total ?? 0,
      status: order?.status ?? "Pending",
      placedAt: order ? new Date(order.placedAt) : new Date(),
    },
  });

  function onDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{order ? `Edit Order ${order.orderNumber}` : "Add Order"}</DialogTitle>
          <DialogDescription>
            {order
              ? "Update the details for this order."
              : "Create a new order for your store."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="customerName" required>Customer</FieldLabel>
            <FieldContent>
              <Input
                id="customerName"
                placeholder="e.g. Emma Wilson"
                aria-invalid={!!errors.customerName}
                aria-describedby={errors.customerName ? "customerName-error" : undefined}
                {...register("customerName")}
              />
              {errors.customerName && (
                <FieldError id="customerName-error" errors={[{ message: errors.customerName.message }]} />
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="itemCount" required>Items</FieldLabel>
              <FieldContent>
                <Input
                  id="itemCount"
                  type="number"
                  min={1}
                  step={1}
                  aria-invalid={!!errors.itemCount}
                  aria-describedby={errors.itemCount ? "itemCount-error" : undefined}
                  {...register("itemCount")}
                />
                {errors.itemCount && (
                  <FieldError id="itemCount-error" errors={[{ message: errors.itemCount.message }]} />
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="total" required>Total</FieldLabel>
              <FieldContent>
                <Input
                  id="total"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={!!errors.total}
                  aria-describedby={errors.total ? "total-error" : undefined}
                  {...register("total")}
                />
                {errors.total && (
                  <FieldError id="total-error" errors={[{ message: errors.total.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="status" required>Status</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                      <SelectTrigger id="status" aria-invalid={!!errors.status}>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <FieldError id="status-error" errors={[{ message: errors.status.message }]} />
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="placedAt" required>Placed on</FieldLabel>
              <FieldContent>
                <Input
                  id="placedAt"
                  type="date"
                  aria-invalid={!!errors.placedAt}
                  aria-describedby={errors.placedAt ? "placedAt-error" : undefined}
                  {...register("placedAt", { setValueAs: (value) => value || undefined })}
                />
                {errors.placedAt && (
                  <FieldError id="placedAt-error" errors={[{ message: errors.placedAt.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>

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
              {isSubmitting
                ? "Saving..."
                : order
                  ? "Save changes"
                  : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
