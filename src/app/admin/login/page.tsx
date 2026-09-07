import { redirect } from "next/navigation";

import {
  Boxes,
  Candy,
  ChartLine,
  LockKeyhole,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { LoginBrand, LoginForm } from "@/components/dashboard/login-form";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Staff sign in — Bonbon",
};

const FEATURES = [
  {
    icon: ShoppingCart,
    label: "Orders",
    text: "Take, fulfill and track every order.",
  },
  {
    icon: Boxes,
    label: "Inventory",
    text: "Keep stock levels in check.",
  },
  {
    icon: ChartLine,
    label: "Reports",
    text: "Revenue insights at a glance.",
  },
];

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session) {
    if (session.role === "customer") {
      redirect("/account/profile");
    }
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-svh bg-muted/40 lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden lg:h-svh">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.55_0.14_55)] to-[oklch(0.55_0.17_330)] p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgb(255_255_255_/_0.14)_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-[oklch(0.55_0.17_330/0.55)] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex aspect-square size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Candy className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-2xl font-bold tracking-tight">
              Bonbon
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              Premium POS
            </span>
          </div>
        </div>

        <div className="relative z-10 flex max-w-md flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur-sm">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Admin &amp; staff console
          </span>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            Run your candy empire from one place.
          </h1>
          <p className="text-base text-primary-foreground/85">
            Orders, inventory, customers and reporting — everything your team
            needs to keep the shop buzzing.
          </p>
          <ul className="flex flex-col gap-3 pt-1">
            {FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                  <feature.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{feature.label}</span>
                  <span className="text-sm text-primary-foreground/80">
                    {feature.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-primary-foreground/80">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Protected area — authorized staff only.
        </p>
      </section>

      {/* Form side */}
      <section className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div
          className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-amber-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <LoginBrand />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-7">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Staff sign in
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access the Bonbon dashboard for staff.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            Protected area — authorized staff only.
          </p>
        </div>
      </section>
    </div>
  );
}