import { redirect } from "next/navigation";

import { LoginBrand, LoginForm } from "@/components/dashboard/login-form";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Sign in — Bonbon",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    if (session.role === "customer") {
      redirect("/account/profile");
    }
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12">
      {/* decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-amber-500/15 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <LoginBrand />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 backdrop-blur">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your Bonbon dashboard to get started.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected area — authorized staff only.
        </p>
      </div>
    </div>
  );
}
