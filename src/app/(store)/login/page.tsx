import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Candy, Clock, History, Package } from "lucide-react";

import { AccountLoginForm } from "@/components/store/account-login-form";
import { getSession } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirect-target";

export const metadata: Metadata = {
  title: "Sign in — Bonbon",
  description:
    "Sign in to your Bonbon account to track orders, save addresses and check out faster.",
};

const BENEFITS = [
  { icon: History, label: "Track orders" },
  { icon: Package, label: "Faster checkout" },
  { icon: Clock, label: "Order history" },
];

/**
 * Customer-facing sign-in for the storefront. Admins and staff sign in at
 * /admin/login. A `?next=` query param returns the customer to where they were
 * headed (e.g. the checkout page after being asked to sign in).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(next);

  const session = await getSession();
  if (session) {
    if (session.role === "customer") {
      redirect(destination ?? "/account/profile");
    }
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-hidden px-4 py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-[oklch(0.72_0.15_75/0.12)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-24 size-96 rounded-full bg-[oklch(0.85_0.09_85/0.16)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 size-40 rounded-full bg-[oklch(0.65_0.16_72/0.08)] blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8">
        {/* Brand + headline */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] text-[oklch(0.25_0.06_50)] shadow-lg shadow-primary/20">
            <Candy className="size-7" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="store-display">Welcome back</h1>
            <p className="store-lead">
              Sign in to pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Track orders, save addresses and check out faster.
            </p>
          </div>

          <AccountLoginForm nextPath={destination} />

          <div className="mt-5 border-t pt-4 text-center text-sm text-muted-foreground">
            New to Bonbon?{" "}
            <Link
              href="/register"
              className="store-link font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Benefits chips */}
        <ul className="grid w-full grid-cols-3 gap-3">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.label}
              className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card/60 px-3 py-3 text-center"
            >
              <benefit.icon
                className="size-4 text-[oklch(0.62_0.13_70)]"
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{benefit.label}</span>
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to keep your details safe — we only use them
          to run your orders.
        </p>
      </div>
    </div>
  );
}