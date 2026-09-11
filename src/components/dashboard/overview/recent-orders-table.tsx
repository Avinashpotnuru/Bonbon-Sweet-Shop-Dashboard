import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
import type { Order } from "@/lib/orders-types";
import { formatDate, formatMoneyExact } from "@/lib/format";
import { statusVariant } from "./status-variant";

export function RecentOrdersTable({
  orders,
  includeYear = true,
}: {
  orders: Order[];
  includeYear?: boolean;
}) {
  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>;
  }
  return (
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
              {formatDate(order.placedAt, includeYear === false ? false : undefined)}
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
  );
}