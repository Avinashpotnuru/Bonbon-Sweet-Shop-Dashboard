"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Candy,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/components/store/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth-types";

const PRIMARY_NAV = [
  {
    label: "Products",
    href: "/shop",
    match: (pathname: string) => pathname === "/shop",
  },
  {
    label: "Categories",
    href: "/shop#categories",
    match: (pathname: string) => pathname.startsWith("/shop/"),
  },
  {
    label: "About",
    href: "/about",
    match: (pathname: string) => pathname === "/about",
  },
  {
    label: "Contact",
    href: "/contact",
    match: (pathname: string) => pathname === "/contact",
  },
] as const satisfies ReadonlyArray<{ label: string; href: string; match: (pathname: string) => boolean }>;

/**
 * Customer-facing site header.
 *
 * Owns: scroll-into-frosted background transition, the expandable search bar,
 * active-link highlighting, and the mobile navigation sheet. Accessible
 * keyboard navigation and aria labels throughout.
 */
export function StoreHeader({ sessionRole }: { sessionRole: Role | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Route the account control by who is browsing:
  //  · guests  → website sign-in page
  //  · customers → their account area
  //  · staff/admins → the dashboard they belong on
  const isStaff = sessionRole !== null && sessionRole !== "customer";
  const accountHref = isStaff
    ? "/dashboard"
    : sessionRole === "customer"
      ? "/account/profile"
      : "/account/login";
  const accountLabel = isStaff
    ? "Dashboard"
    : sessionRole === "customer"
      ? "My account"
      : "Sign in";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setQuery("");
    setSearchOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md transition-[background-color,box-shadow] duration-300",
        "bg-background/60",
        scrolled && "bg-background/90 shadow-sm shadow-primary/5",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            aria-label="Bonbon — home"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] text-[oklch(0.25_0.06_50)] shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <Candy className="size-5" aria-hidden="true" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight transition-colors">
              Bonbon
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 lg:flex"
          >
            {PRIMARY_NAV.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "store-link relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "is-active text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Search className="size-5" aria-hidden="true" />
              )}
            </Button>

            {/* Cart */}
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={`Cart, ${cart.count} ${cart.count === 1 ? "item" : "items"}`}
              className="relative"
              onClick={() => cart.setOpen(true)}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {cart.count > 0 && (
                <Badge
                  className="absolute -right-0.5 -top-0.5 size-5 justify-center rounded-full px-0 text-[0.65rem]"
                  variant="default"
                >
                  {cart.count}
                </Badge>
              )}
            </Button>

            {/* Account */}
            <Button
              asChild
              variant="ghost"
              size="icon-lg"
              className="hidden sm:inline-flex"
            >
              <Link href={accountHref} aria-label={accountLabel}>
                {isStaff ? (
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                ) : (
                  <User className="size-5" aria-hidden="true" />
                )}
              </Link>
            </Button>

            {/* Mobile menu toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Expandable search bar */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            searchOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
            scrolled && "border-t",
          )}
        >
          <div className="overflow-hidden">
            <form
              role="search"
              onSubmit={submitSearch}
              className="flex items-center gap-2 py-3"
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sweets, e.g. caramels, chocolate…"
                  aria-label="Search products"
                  className="pl-9"
                />
              </div>
              <Button type="submit" className="shrink-0">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" showCloseButton className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2.5">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] text-[oklch(0.25_0.06_50)]">
                <Candy className="size-4" aria-hidden="true" />
              </div>
              Bonbon
            </SheetTitle>
          </SheetHeader>

          {/* Mobile search */}
          <div className="px-4">
            <form role="search" onSubmit={submitSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="icon">
                <Search className="size-4" aria-hidden="true" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>

          {/* Mobile nav */}
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
            {PRIMARY_NAV.map((link) => {
              const active = link.match(pathname);
              return (
                <SheetClose asChild key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          <Separator className="mx-4" />

          {/* Mobile footer actions */}
          <SheetClose asChild>
            <Link
              href={accountHref}
              className="mx-4 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {isStaff ? (
                <LayoutDashboard className="size-5" aria-hidden="true" />
              ) : (
                <User className="size-5" aria-hidden="true" />
              )}
              {accountLabel}
            </Link>
          </SheetClose>
          <Separator className="mx-4" />

          <div className="px-4 pb-4">
            <SheetClose asChild>
              <Button asChild className="w-full rounded-xl">
                <Link href="/shop">
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  Shop the collection
                </Link>
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* Shopping cart drawer */}
      <CartDrawer />
    </header>
  );
}
