import { ReportsOverview } from "@/components/dashboard/reports-overview";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Performance analytics across your store.
        </p>
      </div>
      <ReportsOverview />
    </div>
  );
}
