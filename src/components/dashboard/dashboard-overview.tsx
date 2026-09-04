"use client";

import { useEffect, useRef, useState } from "react";
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
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ReportsPayload,
  TrendPoint,
  GroupTotal,
  TopCustomer,
  LowStockProduct,
} from "@/lib/reports-repo";
import type { Order, OrderStatus } from "@/lib/orders-types";
import { roleHasPermission, type Role } from "@/lib/auth-types";
import {
  formatCurrency,
  formatDate,
  formatMoneyCompact,
  formatMoneyExact,
  formatNumber,
  initials,
  monthLabel,
} from "@/lib/format";

type LoadState = "loading" | "success" | "error";

const avatarTones = [
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
];

function statusVariant(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return "default" as const;
    case "Paid":
    case "Shipped":
      return "secondary" as const;
    case "Pending":
      return "outline" as const;
    case "Cancelled":
      return "destructive" as const;
  }
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

function Kpi({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  tone,
  positive = true,
}: {
  label: string;
  value: number;
  delta?: number;
  sub?: string;
  icon: typeof DollarSign;
  tone: string;
  positive?: boolean;
}) {
  const animated = useCountUp(value);

  return (
    <Card size="sm" className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`inline-flex size-9 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold tracking-tight tabular-nums">
            {formatCurrency(animated)}
          </span>
          {delta !== undefined ? (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {positive ? (
                <TrendingUp className="size-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden="true" />
              )}
              {Math.abs(delta).toFixed(1)}%
              <span className="font-normal text-muted-foreground">this period</span>
            </span>
          ) : (
            sub && <span className="text-xs text-muted-foreground">{sub}</span>
          )}
        </div>
      </CardContent>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </Card>
  );
}

function RevenueArea({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No order data to chart yet.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const W = 100;
  const H = 40;
  const pad = 2;

  const points = data.map((d, i) => {
    const x = pad + (i * (W - pad * 2)) / (data.length - 1);
    const y = H - pad - (d.revenue / max) * (H - pad * 2);
    return { ...d, x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(2)},${H - pad} L${points[0].x.toFixed(2)},${H - pad} Z`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {formatCurrency(total)}
        </span>
        <span className="mb-1 text-xs text-muted-foreground">total revenue</span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label="Revenue trend area chart"
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#revGrad)" />
          <path
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-0">
          {points.map((p) => (
            <div key={p.label} className="text-center">
              <span className="text-xs text-muted-foreground">{monthLabel(p.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const donutPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function StatusDonut({ data }: { data: GroupTotal[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>;
  }
  const w = 120;
  const r = 48;
  const c = 2 * Math.PI * r;

  const segments: (GroupTotal & { color: string; frac: number; offset: number })[] = [];
  let offset = 0;
  for (let i = 0; i < data.length; i += 1) {
    const d = data[i];
    const frac = d.value / total;
    segments.push({ ...d, color: donutPalette[i % donutPalette.length], frac, offset });
    offset += frac;
  }

  const sorted = [...segments].sort((a, b) => b.value - a.value);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${w} ${w}`} className="size-32 -rotate-90">
          <circle cx={w / 2} cy={w / 2} r={r} fill="none" strokeWidth="16" className="stroke-muted" />
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx={w / 2}
              cy={w / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.frac * c} ${c}`}
              strokeDashoffset={-seg.offset * c}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{formatNumber(total)}</span>
          <span className="text-[10px] text-muted-foreground">orders</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {sorted.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: seg.color }} aria-hidden="true" />
            <span className="text-muted-foreground">{seg.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ data }: { data: GroupTotal[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No expenses yet.</p>;
  }
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex flex-col gap-3.5">
      {data.slice(0, 6).map((d, i) => (
        <div key={d.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: donutPalette[i % donutPalette.length] }}
                aria-hidden="true"
              />
              {d.name}
            </span>
            <span className="font-medium tabular-nums">{formatMoneyCompact(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: donutPalette[i % donutPalette.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

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
            {orders.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead className="hidden sm:table-cell">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Placed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell>
                        <span className="inline-flex items-center gap-2 font-medium tabular-nums">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                            <ShoppingCart className="size-4" aria-hidden="true" />
                          </span>
                          {order.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{order.customerName}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(order.placedAt, false)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)} className="rounded-full">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoneyExact(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
                <span className="text-xs text-muted-foreground">low {metrics.outOfStock} out of stock</span>
              </div>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All products have healthy stock.
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {lowStockProducts.slice(0, 4).map((p: LowStockProduct) => (
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

function TopCustomerList({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No customers yet.</p>;
  }
  const max = Math.max(...customers.map((c) => c.totalSpent), 1);
  return (
    <div className="flex flex-col divide-y">
      {customers.map((c, i) => (
        <div key={c.name} className="group flex items-center gap-3 py-2.5">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              avatarTones[i % avatarTones.length]
            }`}
          >
            {initials(c.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium">{c.name}</span>
              <span className="ml-2 text-sm font-semibold tabular-nums">
                {formatMoneyCompact(c.totalSpent)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-700"
                  style={{ width: `${(c.totalSpent / max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">{c.ordersCount} orders</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StaffOverview({
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
          <Card key={link.label} size="sm" className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
            <a href={link.href} className="flex items-center gap-3 p-4">
              <div className={`inline-flex size-10 items-center justify-center rounded-xl ${link.tone}`}>
                <link.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{link.label}</span>
                <span className="text-xs text-muted-foreground">Open</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
          ) : orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell>
                      <span className="inline-flex items-center gap-2 font-medium tabular-nums">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                          <ShoppingCart className="size-4" aria-hidden="true" />
                        </span>
                        {order.orderNumber}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{order.customerName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)} className="rounded-full">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoneyExact(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
