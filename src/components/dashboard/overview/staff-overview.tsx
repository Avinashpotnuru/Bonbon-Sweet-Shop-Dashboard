import {
  ArrowRight,
  Boxes,
  CalendarDays,
  PackageSearch,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/orders-types";
import type { LoadState } from "./types";
import { RecentOrdersTable } from "./recent-orders-table";

export function StaffOverview({
  orders,
  loadState,
  onRetry,
}: {
  orders: Order[];
  loadState: LoadState;
  onRetry: () => void;
}) {
  const quickLinks = [
    {
      label: "Products",
      href: "/dashboard/products",
      icon: PackageSearch,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Inventory",
      href: "/dashboard/inventory",
      icon: Boxes,
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      tone: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    },
    {
      label: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.45_0.1_50)] via-[oklch(0.58_0.13_70)] to-[oklch(0.5_0.14_355)] p-6 text-primary-foreground md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Bonbon
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back to the shop floor
            </h2>
            <p className="text-sm text-primary-foreground/85">
              Track orders, update stock, and serve customers right from the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <CalendarDays className="size-5" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Card
            key={link.label}
            size="sm"
            className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
          >
            <a href={link.href} className="flex items-center gap-3 p-4">
              <div className={`inline-flex size-10 items-center justify-center rounded-xl ${link.tone}`}>
                <link.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{link.label}</span>
                <span className="text-xs text-muted-foreground">Open</span>
              </div>
              <ArrowRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Button asChild variant="ghost" size="sm" className="-mr-2 text-muted-foreground">
            <a href="/dashboard/orders">
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {loadState === "loading" ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : loadState === "error" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-6" aria-hidden="true" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Couldn&apos;t load recent orders. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : (
            <RecentOrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}