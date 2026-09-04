"use client";

import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  DollarSign,
  Minus,
  PackageSearch,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  GroupTotal,
  LowStockProduct,
  ReportsPayload,
  TopCustomer,
  TrendPoint,
} from "@/lib/reports-repo";
import {
  formatCurrency,
  formatMoneyExact,
  formatNumber,
  monthLabel,
} from "@/lib/format";

type LoadState = "loading" | "success" | "error";

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof DollarSign;
  tone: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs text-muted-foreground">{label}</span>
          <span className="text-xl font-semibold tabular-nums">{value}</span>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No order data to chart.
      </p>
    );
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex h-52 items-end gap-2">
      {data.map((d) => {
        const height = Math.round((d.revenue / max) * 100);
        return (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-md bg-primary transition-colors group-hover:bg-primary/80"
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <div className="mt-2 truncate text-center text-xs text-muted-foreground">
              {monthLabel(d.label)}
            </div>
            <div className="pointer-events-none absolute bottom-full mb-1 hidden w-full -translate-y-1 flex-col items-center group-hover:flex">
              <span className="whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-xs font-medium text-popover-foreground ring-1 ring-border">
                {formatMoneyExact(d.revenue)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ data }: { data: GroupTotal[] }) {
  const tokenColors = [
    "#b45309",
    "#e11d48",
    "#f59e0b",
    "#059669",
    "#9333ea",
    "#ea580c",
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const w = 120;
  const r = 48;
  const c = 2 * Math.PI * r;

  if (total <= 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No data available.
      </p>
    );
  }

  let offset = 0;
  const segments: (GroupTotal & {
    color: string;
    frac: number;
    offset: number;
  })[] = [];
  for (let i = 0; i < data.length; i += 1) {
    const d = data[i];
    const frac = d.value / total;
    segments.push({ ...d, color: tokenColors[i % tokenColors.length], frac, offset });
    offset += frac;
  }

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${w} ${w}`} className="size-28 shrink-0 -rotate-90">
        <circle
          cx={w / 2}
          cy={w / 2}
          r={r}
          fill="none"
          strokeWidth="18"
          className="stroke-muted"
        />
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx={w / 2}
            cy={w / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.frac * c} ${c}`}
            strokeDashoffset={-seg.offset * c}
          />
        ))}
      </svg>
      <div className="flex min-w-0 flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">{seg.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {Math.round(seg.frac * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ data }: { data: GroupTotal[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.name} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(d.value)}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {d.count} {d.count === 1 ? "order" : "orders"}
              </span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(d.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportsOverview() {
  const [payload, setPayload] = useState<ReportsPayload | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setPayload(data);
        setLoadState("success");
      })
      .catch(() => setLoadState("error"));
  }, [refreshKey]);

  if (loadState === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !payload) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">Failed to load reports</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while generating your reports. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  const { metrics, revenueTrend, salesByStatus, topCustomers, expensesByCategory, lowStockProducts } =
    payload;
  const profitPositive = metrics.netProfit >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          label="Revenue"
          value={formatCurrency(metrics.revenue)}
          icon={DollarSign}
          tone="bg-emerald-600/10 text-emerald-600"
        />
        <Kpi
          label="Orders"
          value={formatNumber(metrics.orders)}
          sub={`Avg ${formatCurrency(metrics.avgOrderValue)}`}
          icon={ShoppingCart}
          tone="bg-primary/10 text-primary"
        />
        <Kpi
          label="Net profit"
          value={formatCurrency(Math.abs(metrics.netProfit))}
          sub={profitPositive ? "Revenue − expenses" : "Loss"}
          icon={profitPositive ? TrendingUp : Minus}
          tone={profitPositive
            ? "bg-emerald-600/10 text-emerald-600"
            : "bg-destructive/10 text-destructive"}
        />
        <Kpi
          label="Customers"
          value={formatNumber(metrics.customers)}
          sub={`${metrics.vips} VIP · ${metrics.activeCustomers} active`}
          icon={Users}
          tone="bg-rose-600/10 text-rose-600"
        />
        <Kpi
          label="Expenses"
          value={formatCurrency(metrics.expenses)}
          icon={Wallet}
          tone="bg-amber-600/10 text-amber-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by status</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={salesByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top customers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCustomersList customers={topCustomers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars data={expensesByCategory} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="size-4 text-amber-600" aria-hidden="true" />
            Low stock alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              All products have healthy stock levels.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {lowStockProducts.map((p: LowStockProduct) => (
                <div key={p.sku} className="flex items-center gap-3 py-2">
                  <BadgeDollarSign className="size-4 text-muted-foreground" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.sku}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-amber-600">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TopCustomersList({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No customers yet.</p>
    );
  }
  return (
    <div className="flex flex-col divide-y">
      {customers.map((c, i) => (
        <div key={c.name} className="flex items-center gap-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {i + 1}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.ordersCount} orders</span>
          </div>
          <span className="font-medium tabular-nums">{formatCurrency(c.totalSpent)}</span>
        </div>
      ))}
    </div>
  );
}
