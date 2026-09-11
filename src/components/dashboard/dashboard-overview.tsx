"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  DollarSign,
  PackageSearch,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReportsPayload } from "@/lib/reports-repo";
import type { Order } from "@/lib/orders-types";
import { roleHasPermission, type Role } from "@/lib/auth-types";
import { formatCurrency, formatMoneyExact } from "@/lib/format";

import type { LoadState } from "./overview/types";
import { Kpi } from "./overview/kpi";
import { RevenueArea, StatusDonut, CategoryBars } from "./overview/charts";
import { TopCustomerList } from "./overview/top-customer-list";
import { RecentOrdersTable } from "./overview/recent-orders-table";
import { StaffOverview } from "./overview/staff-overview";

export function DashboardOverview({ role }: { role: Role }) {
  const [reports, setReports] = useState<ReportsPayload | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const canViewReports = roleHasPermission(role, "reports.view");

  useEffect(() => {
    if (!canViewReports) {
      fetch("/api/orders?sortField=placedAt&sortDirection=desc&pageSize=6")
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => {
          setOrders(data.items);
          setLoadState("success");
        })
        .catch(() => setLoadState("error"));
      return;
    }

    Promise.all([
      fetch("/api/reports").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/orders?sortField=placedAt&sortDirection=desc&pageSize=6").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([reportData, orderData]) => {
        setReports(reportData);
        setOrders(orderData.items);
        setLoadState("success");
      })
      .catch(() => setLoadState("error"));
  }, [refreshKey, canViewReports]);

  if (!canViewReports) {
    return <StaffOverview orders={orders} loadState={loadState} onRetry={() => setRefreshKey((k) => k + 1)} />;
  }

  if (loadState === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !reports) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold">Failed to load the dashboard</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your store overview. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  const { metrics, revenueTrend, salesByStatus, topCustomers, expensesByCategory, lowStockProducts } =
    reports;
  const profitPositive = metrics.netProfit >= 0;

  const lastTwo = revenueTrend.slice(-2);
  const revenueDelta =
    lastTwo.length === 2 && lastTwo[0].revenue > 0
      ? ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100
      : undefined;
  const avgLabel = `avg ${formatMoneyExact(metrics.avgOrderValue)} / order`;
  const customersLabel = `${metrics.activeCustomers} active · ${metrics.vips} VIP`;
  const profitLabel = profitPositive
    ? `margin after ${formatCurrency(metrics.expenses)} expenses`
    : "spend exceeds revenue";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.45_0.1_50)] via-[oklch(0.58_0.13_70)] to-[oklch(0.5_0.14_355)] p-6 text-primary-foreground md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Bonbon
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back to your candy empire
            </h2>
            <p className="text-sm text-primary-foreground/85">
              Here&apos;s how your store is performing today — you&apos;re on track to a great season.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <CalendarDays className="size-5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs text-primary-foreground/80">Reporting period</span>
                <span className="text-sm font-semibold">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
            <Button size="sm" className="bg-white text-primary hover:bg-white/90" asChild>
              <a href="/dashboard/reports">
                Open full reports
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Total revenue"
          value={metrics.revenue}
          delta={revenueDelta}
          positive={revenueDelta === undefined || revenueDelta >= 0}
          icon={DollarSign}
          tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <Kpi
          label="Total orders"
          value={metrics.orders}
          sub={avgLabel}
          icon={ShoppingCart}
          tone="bg-primary/10 text-primary"
        />
        <Kpi
          label="Total customers"
          value={metrics.customers}
          sub={customersLabel}
          icon={Users}
          tone="bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
        />
        <Kpi
          label="Net profit"
          value={Math.abs(metrics.netProfit)}
          positive={profitPositive}
          sub={profitLabel}
          icon={Wallet}
          tone="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
      </section>

      {/* Revenue + donut */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue trend</CardTitle>
            <Badge variant="secondary">
              {revenueTrend.length} {revenueTrend.length === 1 ? "period" : "periods"}
            </Badge>
          </CardHeader>
          <CardContent>
            <RevenueArea data={revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut data={salesByStatus} />
          </CardContent>
        </Card>
      </section>

      {/* Top customers + expenses */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top customers</CardTitle>
            <Button asChild variant="ghost" size="sm" className="-mr-2 text-muted-foreground">
              <a href="/dashboard/customers">
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <TopCustomerList customers={topCustomers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBars data={expensesByCategory} />
          </CardContent>
        </Card>
      </section>

      {/* Recent orders + low stock */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
            <RecentOrdersTable orders={orders} includeYear={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Low stock</CardTitle>
            <Button asChild variant="ghost" size="sm" className="-mr-2 text-muted-foreground">
              <a href="/dashboard/inventory">
                Manage
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
              <div className="inline-flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <PackageSearch className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tabular-nums">{metrics.lowStock}</span>
                <span className="text-xs text-muted-foreground">
                  low {metrics.outOfStock} out of stock
                </span>
              </div>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All products have healthy stock.
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.sku} className="flex items-center gap-3 py-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Boxes className="size-4" aria-hidden="true" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.sku}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {p.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}