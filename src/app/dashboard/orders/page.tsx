import { OrdersTable } from "@/components/dashboard/orders-table";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Track and fulfill your customer orders.
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
