import { ExpensesTable } from "@/components/dashboard/expenses-table";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">
          Track your business costs and spending.
        </p>
      </div>
      <ExpensesTable />
    </div>
  );
}
