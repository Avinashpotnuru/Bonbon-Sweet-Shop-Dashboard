import { CustomersTable } from "@/components/dashboard/customers-table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your store&apos;s customers and their status.
        </p>
      </div>
      <CustomersTable />
    </div>
  );
}
