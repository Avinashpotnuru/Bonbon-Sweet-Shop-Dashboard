import { SettingsPage } from "@/components/dashboard/settings-page";
import { requirePagePermission } from "@/lib/auth";
import { findUserById } from "@/lib/auth-repo";
import { PageBreadcrumb } from "@/components/dashboard/page-breadcrumb";

export default async function SettingsPageRoute() {
  const session = await requirePagePermission(["users.manage"]);
  const user = await findUserById(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb title="Settings" />
      <SettingsPage
        name={user?.name ?? "Store owner"}
        email={user?.email ?? ""}
        role={session.role}
      />
    </div>
  );
}
