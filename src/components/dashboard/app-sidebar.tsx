"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Candy, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { navItems, type NavItem } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { roleHasAny, type Role } from "@/lib/auth-types";

const SECONDARY_HREFS = ["/dashboard/products", "/dashboard/categories", "/dashboard/orders"];

function visible(items: NavItem[], role: Role) {
  return items.filter(
    (item) => !item.permissions || roleHasAny(role, item.permissions),
  );
}

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const main = visible(
    navItems.filter((item) => item.href === "/dashboard"),
    role,
  );
  const manage = visible(
    navItems.filter((item) => SECONDARY_HREFS.includes(item.href)),
    role,
  );
  const insight = visible(
    navItems.filter(
      (item) =>
        item.href !== "/dashboard" && !SECONDARY_HREFS.includes(item.href),
    ),
    role,
  );

  const renderItem = (item: NavItem) => {
    const active = pathname === item.href;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
          className={cn(
            "h-10 rounded-xl text-sm transition-all duration-200 [&>svg]:size-[18px] [&>svg]:shrink-0",
            active
              ? "bg-gradient-to-br from-primary to-[oklch(0.55_0.16_330)] font-semibold text-primary-foreground shadow-md shadow-primary/25"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Link href={item.href}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-white/20 text-primary-foreground"
                  : "text-primary/80 group-hover/menu-button:text-sidebar-accent-foreground"
              )}
            >
              <item.icon aria-hidden="true" />
            </span>
            <span className="truncate">{item.title}</span>
            {active && (
              <span
                className="ml-auto size-1.5 shrink-0 rounded-full bg-primary-foreground/90"
                aria-hidden="true"
              />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border/60 bg-gradient-to-b from-[oklch(0.99_0.004_85)] to-sidebar shadow-[1px_0_0_0_var(--border)]">
      {/* soft caramel glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(120%_120%_at_50%_-10%,oklch(0.9_0.03_70/0.45),transparent_60%)]"
      />

      <SidebarHeader className="relative">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard">
                <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.16_330)] text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/40">
                  <Candy className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading text-[15px] font-bold tracking-tight text-sidebar-foreground">
                    Bonbon
                  </span>
                  <span className="text-[11px] font-medium tracking-wide text-sidebar-foreground/55">
                    Premium POS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative">
        <SidebarGroup>
          <SidebarGroupLabel className="pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{main.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{manage.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{insight.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative">
        {!collapsed && (
          <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-gradient-to-br from-primary/10 via-[oklch(0.85_0.05_60/0.4)] to-transparent p-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-primary/15 blur-2xl"
            />
            <div className="relative flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="size-3" aria-hidden="true" />
                Pro plan
              </div>
              <p className="text-xs font-medium leading-snug text-sidebar-foreground/80">
                Unlock advanced reports &amp; AI insights.
              </p>
              <button
                type="button"
                className="mt-1 inline-flex h-8 w-fit items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.55_0.16_330)] px-3 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-opacity hover:opacity-90"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
