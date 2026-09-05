"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { navItems } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { roleHasAny, type Role } from "@/lib/auth-types";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

export function SiteHeader({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNav = navItems.filter(
    (item) => !item.permissions || roleHasAny(role, item.permissions),
  );
  const current = visibleNav.find((item) => pathname === item.href);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — clear client cookie anyway
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 md:px-6">
      <SidebarTrigger className="-ml-1" />

      {/* Mobile nav */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="font-heading">Bonbon</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1" aria-label="Navigation">
            {visibleNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {current?.icon && (
          <div
            className="hidden size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"
            aria-hidden="true"
          >
            <current.icon className="size-4.5" />
          </div>
        )}
        <div className="flex min-w-0 flex-col">
          <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 sm:block">
            Bonbon <span className="mx-1 text-muted-foreground/40">/</span>
            Dashboard
          </span>
          <h1 className="truncate font-heading text-lg font-semibold leading-tight tracking-tight">
            {current?.title ?? "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative hidden h-9 w-9 rounded-xl hover:bg-muted sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border md:block" aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 items-center gap-2 rounded-xl px-1.5 pl-1 hover:bg-muted"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[oklch(0.55_0.17_330)] text-xs font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start leading-tight lg:flex">
                <span className="text-sm font-medium">Avinash</span>
                <span className="text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground lg:block" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 p-2"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-100/80 via-amber-50/60 to-rose-100/60 p-3 shadow-inner ring-1 ring-amber-900/5 dark:from-amber-500/15 dark:via-amber-500/5 dark:to-rose-500/10">
              <Avatar className="size-11 ring-2 ring-background">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[oklch(0.55_0.17_330)] text-sm font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  Avinash
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  owner@sweetshop.com
                </span>
                <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>

            <div className="my-2 h-px bg-border/70" aria-hidden="true" />

            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2.5 px-2 py-1.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground dark:bg-rose-500/10">
                  <User className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span>Profile</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Manage your account
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 px-2 py-1.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground dark:bg-rose-500/10">
                  <Settings className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span>Settings</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    App preferences
                  </span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <div className="my-2 h-px bg-border/70" aria-hidden="true" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 px-2 py-1.5 text-destructive focus:text-destructive"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut className="size-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span>Sign out</span>
                <span className="text-xs font-normal text-destructive/80">
                  Log out of your session
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
