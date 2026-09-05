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
  {
    icon: History,
    title: "Track your orders",
    text: "Every order lands in your account with live status.",
  },
  {
    icon: Package,
    title: "Check out faster",
    text: "Saved contact and delivery details, ready to go.",
  },
  {
    icon: Clock,
    title: "Your order history",
    text: "Re-order last month's favourites in one tap.",
  },
];

/**
 * Customer-facing sign-in for the storefront. Admins and staff use /login.
 * A `?next=` query param returns the customer to where they were headed
 * (e.g. the checkout page after being asked to sign in).
 */
export default async function AccountLoginPage({
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

      <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-[1fr_24rem] lg:items-center">
        {/* Brand / benefits */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] text-[oklch(0.25_0.06_50)] shadow-md shadow-primary/20">
              <Candy className="size-6" aria-hidden="true" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight">
              Bonbon
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="store-display">
              Welcome{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">back</span>
            </h1>
            <p className="store-lead max-w-md">
              Sign in to pick up right where you left off — your sweet tooth
              will thank you.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.62_0.13_70)]">
                  <benefit.icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-sm font-semibold">{benefit.title}</h2>
                  <p className="text-sm text-muted-foreground">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Continue to your Bonbon storefront account.
            </p>
          </div>

          <div className="mt-2">
            <AccountLoginForm nextPath={destination} />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in you agree to keep your details safe — we only use
            them to run your orders.
          </p>

          <div className="mt-2 border-t pt-4 text-center text-sm text-muted-foreground">
            New to Bonbon?{" "}
            <Link
              href="/account/register"
              className="store-link font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}