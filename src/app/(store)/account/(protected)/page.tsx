import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Package,
  PackageOpen,
  Pencil,
  Phone,
  ShoppingBag,
} from "lucide-react";

import { requireCustomerSession } from "@/lib/customer-auth";
import { findUserById } from "@/lib/auth-repo";
import { listCustomerOrders } from "@/lib/customer-repo";
import { formatDate, formatMoneyExact, initials } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const STATUS_TONE: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  Paid: "bg-emerald-500/10 text-emerald-600",
  Shipped: "bg-sky-500/10 text-sky-600",
  Delivered: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

const RECENT_ORDER_LIMIT = 4;

export default async function AccountHomePage() {
  const session = await requireCustomerSession();
  const user = await findUserById(session.userId);
  if (!user) {
    return null;
  }
  const orders = await listCustomerOrders(session.userId, user.email);
  const recentOrders = orders.slice(0, RECENT_ORDER_LIMIT);
  const firstName = user.name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-[oklch(0.72_0.15_75/0.12)] blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] font-heading text-lg font-bold text-[oklch(0.3_0.08_50)] shadow-md shadow-primary/20">
              {initials(user.name)}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="store-eyebrow">My account</span>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Hi, {firstName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/account/profile">
              <Pencil className="size-4" aria-hidden="true" />
              Edit profile
            </Link>
          </Button>
        </div>

        <Separator className="my-5" />

        <dl className="relative grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="truncate text-sm font-semibold">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Phone
              </dt>
              <dd className="truncate text-sm font-semibold">
                {user.phone || "Not set"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="store-eyebrow">My orders</span>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Recent orders
            </h2>
          </div>
          {orders.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link href="/account/orders">
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card px-6 py-12 text-center shadow-card">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
              <PackageOpen className="size-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex max-w-xs flex-col gap-1">
              <h3 className="font-heading text-lg font-bold">No orders yet</h3>
              <p className="text-sm text-muted-foreground">
                A sweet treat is a few clicks away. Your order history will show
                up here.
              </p>
            </div>
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/shop">
                <ShoppingBag className="size-4" aria-hidden="true" />
                Start shopping
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const statusTone = STATUS_TONE[order.status] ?? "";
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package className="size-5" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-heading font-semibold">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.placedAt)} · {order.itemCount} item
                          {order.itemCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <Badge variant="outline" className={`border-transparent ${statusTone}`}>
                        {order.status}
                      </Badge>
                      <p className="font-heading font-bold tabular-nums">
                        {formatMoneyExact(order.total)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}