import { CustomersTable } from "@/components/dashboard/customers-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Customers" />
      <CustomersTable />
    </div>
  );
}
