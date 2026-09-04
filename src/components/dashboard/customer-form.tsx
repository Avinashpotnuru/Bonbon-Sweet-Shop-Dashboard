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
import {
  CUSTOMER_STATUSES,
} from "@/lib/customer-schemas";
import type { Customer, CustomerStatus } from "@/lib/customers-types";

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required.")
    .max(80, "Customer name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address."),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(80, "City must be 80 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: z.enum(CUSTOMER_STATUSES, {
    message: "Please select a status.",
  }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

const statusOptions: CustomerStatus[] = [...CUSTOMER_STATUSES];

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      city: customer?.city ?? "",
      status: customer?.status ?? "Active",
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
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {customer
              ? `Update the details for ${customer.name}.`
              : "Add a new customer to your store."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="name" required>Name</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                placeholder="e.g. Emma Wilson"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <FieldError id="name-error" errors={[{ message: errors.name.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="email" required>Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="emma@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <FieldError id="email-error" errors={[{ message: errors.email.message }]} />
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  {...register("phone")}
                />
                {errors.phone && (
                  <FieldError id="phone-error" errors={[{ message: errors.phone.message }]} />
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <FieldContent>
                <Input
                  id="city"
                  placeholder="e.g. Portland"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  {...register("city")}
                />
                {errors.city && (
                  <FieldError id="city-error" errors={[{ message: errors.city.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>

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
                : customer
                  ? "Save changes"
                  : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
