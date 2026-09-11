import type { TopCustomer } from "@/lib/reports-repo";
import { formatMoneyCompact, initials } from "@/lib/format";

export const avatarTones = [
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
];

export function TopCustomerList({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No customers yet.</p>;
  }
  const max = Math.max(...customers.map((c) => c.totalSpent), 1);
  return (
    <div className="flex flex-col divide-y">
      {customers.map((c, i) => (
        <div key={c.name} className="group flex items-center gap-3 py-2.5">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              avatarTones[i % avatarTones.length]
            }`}
          >
            {initials(c.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium">{c.name}</span>
              <span className="ml-2 text-sm font-semibold tabular-nums">
                {formatMoneyCompact(c.totalSpent)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-700"
                  style={{ width: `${(c.totalSpent / max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {c.ordersCount} orders
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}