"use client";

import { Candy } from "lucide-react";

import { LoginForm as SharedLoginForm } from "@/components/auth/login-form";

export function LoginForm() {
  return (
    <SharedLoginForm
      endpoint="/api/auth/login-staff"
      redirectTo="/dashboard"
      isRoleAccepted={(role) => role !== "customer"}
      roleError="This is the staff dashboard login. Customer accounts sign in from the storefront account area."
    />
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