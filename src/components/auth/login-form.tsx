"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/auth-schemas";

type Values = z.infer<typeof loginSchema>;

type LoginFormProps = {
  endpoint: string;
  redirectTo: string;
  nextPath?: string;
  isRoleAccepted: (role: string | undefined) => boolean;
  roleError: string;
  buttonClassName?: string;
};

export function LoginForm({
  endpoint,
  redirectTo,
  nextPath,
  isRoleAccepted,
  roleError,
  buttonClassName = "w-full",
}: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error ?? "Unable to sign in. Please try again.");
        return;
      }
      if (!isRoleAccepted(data.user?.role)) {
        setServerError(roleError);
        return;
      }
      router.push(nextPath ?? redirectTo);
      router.refresh();
    } catch {
      setServerError("Unable to sign in. Please try again.");
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
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <FieldError
              id="login-email-error"
              errors={[{ message: errors.email.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <FieldContent>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <FieldError
              id="login-password-error"
              errors={[{ message: errors.password.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Button
        type="submit"
        size="lg"
        className={buttonClassName}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}