"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductArt } from "@/components/store/product-art";
import { ORDER_STORAGE_KEY, type PlacedOrder } from "@/lib/placed-order";
import { formatMoneyExact } from "@/lib/format";

const ESTIMATED_BUSINESS_DAYS = 2; // days from dispatch

function businessDaysFrom(iso: string, days: number): Date {
  const date = new Date(iso);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** No-op subscription — the placed order is a one-shot snapshot, never updates. */
function subscribeNone(): () => void {
  return () => {};
}

/** Read the just-placed order from sessionStorage (client-only). */
function readPlacedOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

export default function OrderSuccessPage() {
  const order = useSyncExternalStore(subscribeNone, readPlacedOrder, readPlacedOrder);

  const handleTrack = () => {
    toast("Tracking on the way", {
      description:
        "You'll receive delivery updates for your order shortly by email.",
    });
  };

  if (!order) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
          <Package className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="store-h1">No order here</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t find a recent order. If you&apos;ve just placed one,
            head back and try again.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const estimated = businessDaysFrom(order.placedAt, ESTIMATED_BUSINESS_DAYS);
  const deliveryAddress = [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.state,
    order.address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ── Success header ── */}
      <div className="order-success-reveal flex flex-col items-center gap-5 text-center">
        <div className="order-success-pop flex size-20 items-center justify-center rounded-full bg-[oklch(0.72_0.15_75/0.15)]">
          <CheckCircle2 className="size-10 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="store-eyebrow">Order confirmed</span>
          <h1 className="store-h1">Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Your order is confirmed and our kitchen is getting it ready. A
            receipt is on its way to{" "}
            <span className="font-medium text-foreground">{order.customerEmail}</span>.
          </p>
        </div>

        <div className="order-success-reveal d1 rounded-2xl border bg-card px-6 py-4 shadow-card">
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">
            Order number
          </span>
          <span className="font-heading text-2xl font-bold tracking-tight">
            {order.orderNumber}
          </span>
        </div>
      </div>

      <Separator className="order-success-reveal d1 my-8" />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* ── Delivery information ── */}
        <section className="order-success-reveal d1 flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Truck className="size-5 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
            Delivery
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <p className="inline-flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {deliveryAddress}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {order.customerPhone}
            </p>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              {order.customerEmail}
            </p>
          </div>

          <Separator className="my-1" />

          <p className="inline-flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
            <span>
              Estimated delivery{" "}
              <span className="font-semibold text-foreground">
                {formatDate(estimated)}
              </span>
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Paying by {order.paymentMethod}.
          </p>
        </section>

        {/* ── Order summary ── */}
        <section className="order-success-reveal d2 flex flex-col rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
            <ShoppingBag className="size-5 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
            Order summary
          </h2>

          <div className="mb-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <ProductArt name={item.name} className="size-11 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {formatMoneyExact(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatMoneyExact(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-3" />

          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatMoneyExact(order.amounts.subtotal)}</dd>
            </div>
            {order.amounts.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Discount{order.coupon ? ` (${order.coupon})` : ""}
                </dt>
                <dd className="text-emerald-600 tabular-nums dark:text-emerald-500">
                  −{formatMoneyExact(order.amounts.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">
                {order.amounts.delivery === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-500">Free</span>
                ) : (
                  formatMoneyExact(order.amounts.delivery)
                )}
              </dd>
            </div>
          </dl>

          <Separator className="my-3" />

          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-heading text-xl font-bold tabular-nums">
              {formatMoneyExact(order.amounts.total)}
            </span>
          </div>
        </section>
      </div>

      {/* ── CTAs ── */}
      <div className="order-success-reveal d3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="w-full rounded-xl sm:w-auto" onClick={handleTrack}>
          <Package className="mr-2 size-4" aria-hidden="true" />
          Track order
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full rounded-xl sm:w-auto">
          <Link href="/shop">
            Continue shopping
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
