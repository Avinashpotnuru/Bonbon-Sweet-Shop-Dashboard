import { InventoryTable } from "@/components/dashboard/inventory-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Inventory" />
      <InventoryTable />
    </div>
  );
}
