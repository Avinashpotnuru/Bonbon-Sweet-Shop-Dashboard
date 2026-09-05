import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ShopControls } from "@/components/store/shop-controls";
import { ShopProductGrid } from "@/components/store/shop-product-grid";
import {
  getStoreCategories,
  getStoreProducts,
} from "@/lib/store-data";

export const metadata: Metadata = {
  title: "Shop — Bonbon",
  description: "Browse our full collection of small-batch artisan confectionery.",
};

export const dynamic = "force-dynamic";

type SortKey = { field: "price" | "name"; dir: "asc" | "desc" };

function resolveSort(sort: string): SortKey {
  switch (sort) {
    case "price-asc":
      return { field: "price", dir: "asc" };
    case "price-desc":
      return { field: "price", dir: "desc" };
    case "name-desc":
      return { field: "name", dir: "desc" };
    default:
      return { field: "name", dir: "asc" };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { q, sort, category, minPrice, maxPrice } = await searchParams;
  const sortKey = resolveSort(sort ?? "featured");

  const [categories, { items, total }] = await Promise.all([
    getStoreCategories(),
    getStoreProducts({
      search: q ?? "",
      category: category ?? "",
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    }),
  ]);

  const sorted = [...items].sort((a, b) => {
    if (sortKey.field === "price") {
      return sortKey.dir === "asc" ? a.price - b.price : b.price - a.price;
    }
    return sortKey.dir === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  return (
    <div className="relative">
      {/* ── Premium page header ── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-[oklch(0.94_0.03_78)] via-[oklch(0.96_0.025_82)] to-[oklch(0.92_0.06_80)]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[oklch(0.72_0.15_75/0.08)] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-[oklch(0.65_0.16_72/0.06)] blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="shop-header-reveal d1 store-eyebrow inline-flex items-center gap-2">
            <Sparkles className="size-3.5" aria-hidden="true" />
            The collection
          </span>

          <h1 className="shop-header-reveal d2 store-h1">Shop all sweets</h1>

          <p className="shop-header-reveal d3 store-lead max-w-lg text-sm">
            Premium chocolates, silky caramels and fruity gummies — handcrafted
            daily in small batches from natural ingredients.
          </p>

          <div className="shop-header-reveal d4 mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span>
            {total === 1 ? "product" : "products"}
            {q && (
              <>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                matching &ldquo;{q}&rdquo;
              </>
            )}
            {category && (
              <>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                in {categories.find((c) => c.slug === category)?.name ?? category}
              </>
            )}
          </div>

          <div className="shop-header-reveal d4 mt-2 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="store-link text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-foreground">Shop</span>
          </div>
        </div>
      </section>

      {/* ── Filters + grid ── */}
      <div className="shop-filters-reveal mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <ShopControls
            key={`${q ?? ""}-${sort ?? ""}-${category ?? ""}-${minPrice ?? ""}-${maxPrice ?? ""}`}
            categories={categories}
            activeCategory={category}
          />
        </div>

        <ShopProductGrid products={sorted} />
      </div>
    </div>
  );
}
