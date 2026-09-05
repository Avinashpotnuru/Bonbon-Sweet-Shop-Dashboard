import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Mail, Package } from "lucide-react";

import { requireCustomerSession } from "@/lib/customer-auth";
import { findUserById } from "@/lib/auth-repo";
import { getCustomerOrder } from "@/lib/customer-repo";
import { formatDate, formatMoneyExact } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductArt } from "@/components/store/product-art";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  Paid: "bg-emerald-500/10 text-emerald-600",
  Shipped: "bg-sky-500/10 text-sky-600",
  Delivered: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await requireCustomerSession();
  const user = await findUserById(session.userId);
  const order = await getCustomerOrder(session.userId, user?.email ?? "", orderNumber);

  if (!order) {
    notFound();
  }

  const statusTone = STATUS_TONE[order.status] ?? "";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to orders
      </Link>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold">{order.orderNumber}</h2>
            <Badge variant="outline" className={`border-transparent ${statusTone}`}>
              {order.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.placedAt)}
          </p>
        </div>
        <p className="font-heading text-2xl font-bold tabular-nums">
          {formatMoneyExact(order.total)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-heading text-lg font-bold">Items</h3>
          {(order.items ?? []).map((item) => (
            <div key={item.productId} className="flex gap-4 py-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                <ProductArt name={item.name} className="size-16" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty {item.quantity} × {formatMoneyExact(item.price)}
                </p>
              </div>
              <p className="font-semibold tabular-nums">
                {formatMoneyExact(item.price * item.quantity)}
              </p>
            </div>
          ))}

          <Separator className="my-2" />
          {order.amounts && (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">
                  {formatMoneyExact(order.amounts.subtotal)}
                </dd>
              </div>
              {order.amounts.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Discount{order.coupon ? ` (${order.coupon})` : ""}
                  </dt>
                  <dd className="font-medium text-emerald-600 tabular-nums dark:text-emerald-500">
                    −{formatMoneyExact(order.amounts.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium tabular-nums">
                  {order.amounts.delivery === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-500">Free</span>
                  ) : (
                    formatMoneyExact(order.amounts.delivery)
                  )}
                </dd>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <dt className="font-heading font-bold">Total</dt>
                <dd className="font-heading text-xl font-bold tabular-nums">
                  {formatMoneyExact(order.amounts.total)}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <div className="flex flex-col gap-6">
          {order.address && (
            <section className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
                <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                Delivery address
              </h3>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                <p className="text-foreground">{order.customerName}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}
                  {order.address.state ? `, ${order.address.state}` : ""}{" "}
                  {order.address.postalCode}
                </p>
              </address>
            </section>
          )}

          <section className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="font-heading text-lg font-bold">Contact</h3>
            {order.customerEmail && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
                {order.customerEmail}
              </p>
            )}
            {order.customerName && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4" aria-hidden="true" />
                {order.customerName}
              </p>
            )}
          </section>

          {order.paymentMethod && (
            <section className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="mb-2 font-heading text-lg font-bold">Payment</h3>
              <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
