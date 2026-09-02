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

const PRIMARY_ITEMS = ["/dashboard"];
const SECONDARY_HREFS = ["/dashboard/products", "/dashboard/categories", "/dashboard/orders"];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const main = navItems.filter((item) => item.href === "/dashboard");
  const manage = navItems.filter((item) => SECONDARY_HREFS.includes(item.href));
  const insight = navItems.filter(
    (item) => !PRIMARY_ITEMS.includes(item.href) && !SECONDARY_HREFS.includes(item.href)
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
              ? "bg-gradient-to-br from-primary to-[oklch(0.55_0.17_330)] font-medium text-white shadow-lg shadow-primary/30"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
          )}
        >
          <Link href={item.href}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground"
              )}
            >
              <item.icon aria-hidden="true" />
            </span>
            <span className="truncate">{item.title}</span>
            {active && (
              <span className="ml-auto size-1.5 shrink-0 rounded-full bg-white/90" aria-hidden="true" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard">
                <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.17_330)] text-sidebar-primary-foreground shadow-lg shadow-primary/30">
                  <Candy className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading text-[15px] font-bold tracking-tight">
                    Bonbon
                  </span>
                  <span className="text-[11px] font-medium tracking-wide text-sidebar-foreground/60">
                    Premium POS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
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

      <SidebarFooter>
        {!collapsed && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/90 to-[oklch(0.5_0.16_340)] p-4 text-sidebar-primary-foreground">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-white/15 blur-xl"
            />
            <div className="relative flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                <Sparkles className="size-3" aria-hidden="true" />
                Pro plan
              </div>
              <p className="text-xs font-medium leading-snug">
                Unlock advanced reports &amp; AI insights.
              </p>
              <button
                type="button"
                className="mt-1 inline-flex h-8 w-fit items-center justify-center rounded-lg bg-sidebar-primary-foreground px-3 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
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
