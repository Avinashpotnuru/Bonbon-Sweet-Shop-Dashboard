"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StoreCategory } from "@/lib/store-data";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
] as const;

type ActiveFilters = {
  q: string;
  category: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
};

function readFilters(sp: URLSearchParams): ActiveFilters {
  return {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "",
    sort: sp.get("sort") ?? "featured",
    minPrice: sp.get("minPrice") ?? "",
    maxPrice: sp.get("maxPrice") ?? "",
  };
}

function countActive(f: ActiveFilters) {
  let n = 0;
  if (f.q) n++;
  if (f.category) n++;
  if (f.minPrice) n++;
  if (f.maxPrice) n++;
  if (f.sort !== "featured") n++;
  return n;
}

const SORT_LABELS: Record<string, string> = {
  featured: "Featured",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  "name-asc": "A → Z",
  "name-desc": "Z → A",
};

export function ShopControls({
  categories,
  activeCategory,
}: {
  categories: StoreCategory[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = readFilters(searchParams);
  const [search, setSearch] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [mobileOpen, setMobileOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const active = activeCategory ?? initial.category;
  const activeCount = countActive(initial);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const pushParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value && value !== "featured") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ q: value || undefined });
    }, 320);
  }

  function handleSortChange(value: string) {
    setSort(value);
    pushParams({ sort: value });
  }

  function handleCategoryClick(slug: string) {
    pushParams({ category: active === slug ? undefined : slug });
  }

  function clearAll() {
    setSearch("");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    pushParams({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
    setMobileOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + sort + mobile filter button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search sweets…"
            className="h-10 pl-9"
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-10 rounded-lg px-3 md:hidden"
                aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ""}`}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                <span className="ml-1.5 hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.72_0.15_75)] text-[0.6rem] font-bold text-[oklch(0.2_0.04_55)]"
                    aria-hidden="true"
                  >
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] sm:max-h-[70vh]">
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading text-lg">Filters</SheetTitle>
                <SheetDescription>
                  Refine your search
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Categories */}
                <div className="mb-5">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!active ? "secondary" : "outline"}
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleCategoryClick("")}
                    >
                      All
                    </Button>
                    {categories.map((c) => (
                      <Button
                        key={c.slug}
                        variant={active === c.slug ? "secondary" : "outline"}
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleCategoryClick(c.slug)}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <form onSubmit={applyPrice}>
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price range
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-9 flex-1"
                      aria-label="Minimum price"
                    />
                    <span className="text-sm text-muted-foreground">–</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-9 flex-1"
                      aria-label="Maximum price"
                    />
                    <Button type="submit" size="sm" className="rounded-lg">
                      Apply
                    </Button>
                  </div>
                </form>
              </div>

              <SheetFooter className="border-t px-6 py-4">
                <SheetClose asChild>
                  <Button variant="outline" className="rounded-xl">
                    Done
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Sort products">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: category pills (desktop) + active filter chips + clear */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:gap-2.5">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={!active ? "secondary" : "outline"}
            size="sm"
            className="shrink-0 rounded-xl px-3.5"
            onClick={() => handleCategoryClick("")}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.slug}
              variant={active === c.slug ? "secondary" : "outline"}
              size="sm"
              className="hidden shrink-0 whitespace-nowrap rounded-xl px-3.5 md:inline-flex"
              onClick={() => handleCategoryClick(c.slug)}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {initial.minPrice && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              From ${initial.minPrice}
              <button
                onClick={() => pushParams({ minPrice: undefined })}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                aria-label="Remove minimum price filter"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {initial.maxPrice && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              Up to ${initial.maxPrice}
              <button
                onClick={() => pushParams({ maxPrice: undefined })}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                aria-label="Remove maximum price filter"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {initial.q && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              &ldquo;{initial.q}&rdquo;
              <button
                onClick={() => {
                  setSearch("");
                  pushParams({ q: undefined });
                }}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                aria-label="Clear search"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {sort !== "featured" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {SORT_LABELS[sort] ?? sort}
              <button
                onClick={() => {
                  setSort("featured");
                  pushParams({ sort: undefined });
                }}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                aria-label="Clear sort"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
