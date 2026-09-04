import { ProductsTable } from "@/components/dashboard/products-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Products" />
      <ProductsTable />
    </div>
  );
}
