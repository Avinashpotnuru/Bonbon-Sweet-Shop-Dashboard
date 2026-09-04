import { ExpensesTable } from "@/components/dashboard/expenses-table";
import { requirePagePermission } from "@/lib/auth";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default async function ExpensesPage() {
  await requirePagePermission(["expenses.view"]);

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Expenses" />
      <ExpensesTable />
    </div>
  );
}
