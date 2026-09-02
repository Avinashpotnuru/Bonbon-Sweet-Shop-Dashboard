import { ProductsTable } from "@/components/dashboard/products-table";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your candy inventory, pricing, and stock levels.
        </p>
      </div>
      <ProductsTable />
    </div>
  );
}
