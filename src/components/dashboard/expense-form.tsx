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
import { EXPENSE_CATEGORIES } from "@/lib/expense-schemas";
import type { Expense, ExpenseCategory } from "@/lib/expenses-types";

const expenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(120, "Description must be 120 characters or fewer."),
  category: z.enum(EXPENSE_CATEGORIES, { message: "Please select a category." }),
  amount: z.coerce
    .number()
    .min(0.01, "Amount must be at least 0.01.")
    .max(1000000, "Amount must be 1,000,000 or less."),
  date: z.coerce.date({ message: "Please provide a valid date." }),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

const categoryOptions: ExpenseCategory[] = [...EXPENSE_CATEGORIES];

export function ExpenseForm({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onSubmit: (values: ExpenseFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: expense?.description ?? "",
      category: expense?.category ?? "Ingredients",
      amount: expense?.amount ?? 0,
      date: expense ? new Date(expense.date) : new Date(),
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details for this expense."
              : "Record a new business expense."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="description" required>Description</FieldLabel>
            <FieldContent>
              <Input
                id="description"
                placeholder="e.g. Monthly shop rent"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
                {...register("description")}
              />
              {errors.description && (
                <FieldError id="description-error" errors={[{ message: errors.description.message }]} />
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="category" required>Category</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                      <SelectTrigger id="category" aria-invalid={!!errors.category}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <FieldError id="category-error" errors={[{ message: errors.category.message }]} />
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="amount" required>Amount</FieldLabel>
              <FieldContent>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                  {...register("amount")}
                />
                {errors.amount && (
                  <FieldError id="amount-error" errors={[{ message: errors.amount.message }]} />
                )}
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="date" required>Date</FieldLabel>
            <FieldContent>
              <Input
                id="date"
                type="date"
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
                {...register("date", { setValueAs: (value) => value || undefined })}
              />
              {errors.date && (
                <FieldError id="date-error" errors={[{ message: errors.date.message }]} />
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
                : expense
                  ? "Save changes"
                  : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
