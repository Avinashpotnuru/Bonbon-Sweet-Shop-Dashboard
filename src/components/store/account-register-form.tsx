"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { customerRegisterSchema } from "@/lib/customer-auth-schemas";

const registerSchema = customerRegisterSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof registerSchema>;

/**
 * Customer-facing registration. Creates the account via the public
 * `/api/auth/register-customer` endpoint (stored in the users collection,
 * `customer` role) and then auto-signs-in so new customers land straight in
 * their account area.
 */
export function AccountRegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const registerRes = await fetch("/api/auth/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }),
      });
      const registerData = await registerRes.json().catch(() => ({}));
      if (!registerRes.ok) {
        setServerError(registerData.error ?? "Unable to create your account.");
        return;
      }

      // Auto sign-in — registration endpoints never set a session.
      const loginRes = await fetch("/api/auth/login-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      if (!loginRes.ok) {
        router.push("/login");
        return;
      }

      router.push(nextPath ?? "/account/profile");
      router.refresh();
    } catch {
      setServerError("Unable to create your account. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {serverError}
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="account-register-name">Full name</FieldLabel>
        <FieldContent>
          <Input
            id="account-register-name"
            autoComplete="name"
            placeholder="Priya Sharma"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "account-register-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <FieldError
              id="account-register-name-error"
              errors={[{ message: errors.name.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="account-register-email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="account-register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "account-register-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <FieldError
              id="account-register-email-error"
              errors={[{ message: errors.email.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="account-register-phone">Phone (optional)</FieldLabel>
        <FieldContent>
          <Input
            id="account-register-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "account-register-phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && (
            <FieldError
              id="account-register-phone-error"
              errors={[{ message: errors.phone.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="account-register-password">Password</FieldLabel>
        <FieldContent>
          <Input
            id="account-register-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "account-register-password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <FieldError
              id="account-register-password-error"
              errors={[{ message: errors.password.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="account-register-confirm">Confirm password</FieldLabel>
        <FieldContent>
          <Input
            id="account-register-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "account-register-confirm-error" : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldError
              id="account-register-confirm-error"
              errors={[{ message: errors.confirmPassword.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link
          href="/login"
          className="store-link font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}