import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Candy, Heart, Sparkles, Truck } from "lucide-react";

import { AccountRegisterForm } from "@/components/store/account-register-form";
import { getSession } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirect-target";

export const metadata: Metadata = {
  title: "Create account — Bonbon",
  description:
    "Join Bonbon to track orders, save addresses and check out faster.",
};

const PERKS = [
  {
    icon: Truck,
    title: "Faster checkout",
    text: "Your details are remembered for next time.",
  },
  {
    icon: Heart,
    title: "Order tracking",
    text: "Every order stays in your account history.",
  },
  {
    icon: Sparkles,
    title: "Updates only",
    text: "We only email about your orders — no spam.",
  },
];

/**
 * Customer-facing registration for the storefront. Accounts are stored with
 * a `customer` role (zero dashboard permissions). On success the form signs
 * the new customer in automatically, so they land straight in their account.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(next);

  const session = await getSession();
  if (session) {
    redirect(destination ?? "/account/profile");
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
        {/* Brand / perks */}
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
              Create your{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">account</span>
            </h1>
            <p className="store-lead max-w-md">
              A tiny sweet-tooth membership. Order, track, and come back to
              your favourites.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.62_0.13_70)]">
                  <perk.icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-sm font-semibold">{perk.title}</h2>
                  <p className="text-sm text-muted-foreground">{perk.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Join Bonbon
            </h2>
            <p className="text-sm text-muted-foreground">
              It takes less than a minute.
            </p>
          </div>

          <div className="mt-2">
            <AccountRegisterForm nextPath={destination} />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Your details are stored securely — passwords are hashed and never
            shared.
          </p>
        </div>
      </div>
    </div>
  );
}