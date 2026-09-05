import Link from "next/link";
import { Package, PackageOpen } from "lucide-react";

import { requireCustomerSession } from "@/lib/customer-auth";
import { findUserById } from "@/lib/auth-repo";
import { listCustomerOrders } from "@/lib/customer-repo";
import { formatDate, formatMoneyExact } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  Paid: "bg-emerald-500/10 text-emerald-600",
  Shipped: "bg-sky-500/10 text-sky-600",
  Delivered: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default async function OrdersPage() {
  const session = await requireCustomerSession();
  const user = await findUserById(session.userId);
  const email = user?.email ?? "";
  const orders = await listCustomerOrders(session.userId, email);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="store-eyebrow">Orders</p>
        <h2 className="font-heading text-2xl font-bold">Your orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border bg-card px-6 py-16 text-center shadow-card">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
            <PackageOpen className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold">No orders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When you place an order it will appear here.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed {formatDate(order.placedAt)} · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                <Badge
                  variant="outline"
                  className={`border-transparent ${STATUS_TONE[order.status] ?? ""}`}
                >
                  {order.status}
                </Badge>
                <span className="font-heading text-lg font-bold tabular-nums">
                  {formatMoneyExact(order.total)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
