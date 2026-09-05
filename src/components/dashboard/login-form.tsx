"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Candy, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/auth-schemas";
import type { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(
          data.error ?? "Unable to sign in. Please try again.",
        );
        return;
      }
      if (data.user?.role === "customer") {
        setServerError(
          "This is the staff dashboard login. Customer accounts sign in from the storefront account area.",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Unable to sign in. Please try again.");
    }
  }

  return (
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

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
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

export function LoginBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.16_330)] text-primary-foreground shadow-lg shadow-primary/30">
        <Candy className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading text-xl font-bold tracking-tight">Bonbon</span>
        <span className="text-xs text-muted-foreground">Premium POS</span>
      </div>
    </div>
  );
}
