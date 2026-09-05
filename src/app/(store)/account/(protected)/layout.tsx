import { requireCustomerSession } from "@/lib/customer-auth";
import { findUserById } from "@/lib/auth-repo";
import { AccountSidebar } from "@/components/store/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomerSession();
  const user = await findUserById(session.userId);
  const name = user?.name || "Customer";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          My account
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, orders, addresses and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <AccountSidebar name={name} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
