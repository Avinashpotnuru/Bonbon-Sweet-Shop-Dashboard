import { OrdersTable } from "@/components/dashboard/orders-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Orders" />
      <OrdersTable />
    </div>
  );
}
