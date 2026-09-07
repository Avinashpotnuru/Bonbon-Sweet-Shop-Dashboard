"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { staffCreateSchema, staffUpdateSchema } from "@/lib/auth-schemas";
import type { StaffRole, UserStatus } from "@/lib/auth-types";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
};

export type StaffFormValues = {
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status: UserStatus;
  password?: string;
};

function buildResolver(isEdit: boolean): Resolver<StaffFormValues> {
  return (isEdit ? zodResolver(staffUpdateSchema) : zodResolver(staffCreateSchema)) as Resolver<StaffFormValues>;
}

export type StaffServerError = {
  message: string;
  email?: string;
};

export function StaffForm({
  open,
  onOpenChange,
  member,
  serverError,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: StaffMember;
  serverError?: StaffServerError | null;
  onSubmit: (values: StaffFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: buildResolver(Boolean(member)),
    defaultValues: {
      name: member?.name ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      role: member?.role ?? "staff",
      status: member?.status ?? "active",
      password: "",
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
          <DialogTitle>{member ? "Edit staff member" : "Add staff member"}</DialogTitle>
          <DialogDescription>
            {member
              ? "Update the details for this staff member."
              : "Create a new staff or manager account."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          {serverError && (
            <div
              role="alert"
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {serverError.message}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="staff-name" required>Name</FieldLabel>
            <FieldContent>
              <Input
                id="staff-name"
                placeholder="e.g. Sarah Ahmed"
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "staff-name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <FieldError id="staff-name-error" errors={[{ message: errors.name.message }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="staff-email" required>Email</FieldLabel>
            <FieldContent>
              <Input
                id="staff-email"
                type="email"
                placeholder="sarah@bonbon.app"
                autoComplete="off"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "staff-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <FieldError id="staff-email-error" errors={[{ message: errors.email.message }]} />
              )}
              {serverError?.email && !errors.email && (
                <FieldError id="staff-email-error" errors={[{ message: serverError.email }]} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="staff-phone">Phone</FieldLabel>
            <FieldContent>
              <Input
                id="staff-phone"
                type="tel"
                placeholder="Optional"
                autoComplete="off"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "staff-phone-error" : undefined}
                {...register("phone")}
              />
              {errors.phone && (
                <FieldError id="staff-phone-error" errors={[{ message: errors.phone.message }]} />
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="staff-role" required>Role</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                      <SelectTrigger id="staff-role" aria-invalid={!!errors.role}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <FieldError id="staff-role-error" errors={[{ message: errors.role.message }]} />
                )}
              </FieldContent>
            </Field>

            {member && (
              <Field>
                <FieldLabel htmlFor="staff-status">Status</FieldLabel>
                <FieldContent>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                        <SelectTrigger id="staff-status" aria-invalid={!!errors.status}>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <FieldError id="staff-status-error" errors={[{ message: errors.status.message }]} />
                  )}
                </FieldContent>
              </Field>
            )}
          </div>

          <Field>
            <FieldLabel htmlFor="staff-password" required={!member}>
              {member ? "New password" : "Password"}
            </FieldLabel>
            <FieldContent>
              <Input
                id="staff-password"
                type="password"
                autoComplete="new-password"
                placeholder={member ? "Leave blank to keep current password" : "At least 8 characters"}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "staff-password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <FieldError id="staff-password-error" errors={[{ message: errors.password.message }]} />
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
                : member
                  ? "Save changes"
                  : "Add staff member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}