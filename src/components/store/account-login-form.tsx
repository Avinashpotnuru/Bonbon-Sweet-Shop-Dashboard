"use client";

import Link from "next/link";
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

export function AccountLoginForm({ nextPath }: { nextPath?: string }) {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error ?? "Unable to sign in. Please try again.");
        return;
      }
      if (data.user?.role === "customer") {
        router.push(nextPath ?? "/account/profile");
      } else {
        router.push("/dashboard");
      }
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
        <FieldLabel htmlFor="account-login-email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="account-login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "account-login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <FieldError
              id="account-login-email-error"
              errors={[{ message: errors.email.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="account-login-password">Password</FieldLabel>
        <FieldContent>
          <Input
            id="account-login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "account-login-password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <FieldError
              id="account-login-password-error"
              errors={[{ message: errors.password.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to Bonbon?{" "}
        <Link href="/account/register" className="store-link font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
