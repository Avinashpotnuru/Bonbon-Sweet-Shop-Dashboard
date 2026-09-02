"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export function SiteHeader() {
  const pathname = usePathname();
  const current = navItems.find((item) => pathname === item.href);

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
            {navItems.map((item) => {
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
                <span className="text-[11px] text-muted-foreground">Store owner</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground lg:block" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="size-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[oklch(0.55_0.17_330)] text-xs font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Avinash</span>
                <span className="text-xs text-muted-foreground">owner@sweetshop.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="size-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
