import { ReportsOverview } from "@/components/dashboard/reports-overview";
import { requirePagePermission } from "@/lib/auth";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default async function ReportsPage() {
  await requirePagePermission(["reports.view"]);

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Reports" />
      <ReportsOverview />
    </div>
  );
}
