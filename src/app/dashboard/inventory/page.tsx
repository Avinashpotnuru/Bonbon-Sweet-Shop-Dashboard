import { InventoryTable } from "@/components/dashboard/inventory-table";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Monitor and adjust your product stock levels.
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}
