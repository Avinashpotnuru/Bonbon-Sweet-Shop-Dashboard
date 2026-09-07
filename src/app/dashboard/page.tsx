import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          A live overview of your store&apos;s performance.
        </p>
      </div>
      <DashboardOverview role={session.role} />
    </div>
  );
}