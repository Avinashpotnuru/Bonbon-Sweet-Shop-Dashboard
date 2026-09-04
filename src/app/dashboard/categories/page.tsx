import { CategoriesTable } from "@/components/dashboard/categories-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Categories" />
      <CategoriesTable />
    </div>
  );
}
