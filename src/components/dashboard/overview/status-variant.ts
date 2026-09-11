import type { OrderStatus } from "@/lib/orders-types";

export function statusVariant(status: OrderStatus) {
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