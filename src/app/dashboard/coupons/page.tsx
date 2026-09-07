import { CouponsTable } from "@/components/dashboard/coupons-table";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default function CouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Coupons" />
      <CouponsTable />
    </div>
  );
}