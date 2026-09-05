"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const ACCOUNT_NAV = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Saved addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
] as const;

function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
      )}
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </button>
  );
}

export function AccountSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 rounded-2xl border bg-card p-2 shadow-card lg:w-64">
      <div className="border-b px-3 pb-4 pt-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">My account</p>
        <p className="mt-1 font-heading text-lg font-bold">{name}</p>
      </div>
      <nav aria-label="Account" className="mt-2 flex flex-col gap-1">
        {ACCOUNT_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-2 border-t pt-2">
        <Link
          href="/shop"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          Continue shopping
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
