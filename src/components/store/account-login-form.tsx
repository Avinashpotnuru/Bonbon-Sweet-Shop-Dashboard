"use client";

import { LoginForm } from "@/components/auth/login-form";

export function AccountLoginForm({ nextPath }: { nextPath?: string }) {
  return (
    <LoginForm
      endpoint="/api/auth/login-customer"
      redirectTo="/account/profile"
      nextPath={nextPath}
      isRoleAccepted={(role) => role === "customer"}
      roleError="This sign-in is for storefront customers. Staff and admins sign in from the Admin Dashboard."
      buttonClassName="w-full rounded-xl"
    />
  );
}