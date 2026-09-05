import { requireCustomerSession } from "@/lib/customer-auth";
import { findUserById } from "@/lib/auth-repo";
import { formatDate } from "@/lib/format";
import { Mail, MapPin, Package, User } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await requireCustomerSession();
  const user = await findUserById(session.userId);
  if (!user) {
    return <p className="text-muted-foreground">Account not found.</p>;
  }

  const statCards = [
    {
      label: "Name",
      value: user.name,
      icon: User,
    },
    {
      label: "Email",
      value: user.email,
      icon: Mail,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <p className="store-eyebrow">Profile</p>
        <h2 className="font-heading text-2xl font-bold">Your details</h2>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl bg-muted/50 p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {s.label}
                </dt>
                <dd className="mt-1 font-heading text-lg font-semibold break-words">
                  {s.value}
                </dd>
              </div>
            );
          })}
          <div className="rounded-xl bg-muted/50 p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" aria-hidden="true" />
              Member since
            </dt>
            <dd className="mt-1 font-heading text-lg font-semibold">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading font-semibold">View your orders</p>
            <p className="text-sm text-muted-foreground">Track and review past purchases</p>
          </div>
        </Link>
        <Link
          href="/account/addresses"
          className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading font-semibold">Saved addresses</p>
            <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
