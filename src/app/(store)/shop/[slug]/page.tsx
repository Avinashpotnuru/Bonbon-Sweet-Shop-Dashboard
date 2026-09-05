import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { ShopProductGrid } from "@/components/store/shop-product-grid";
import {
  getCategoryBySlug,
  getStoreProducts,
} from "@/lib/store-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category ? `${category.name} — Bonbon` : "Shop — Bonbon",
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, total } = await getStoreProducts({ category: slug });

  return (
    <div className="relative">
      {/* ── Premium page header ── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-[oklch(0.94_0.03_78)] via-[oklch(0.96_0.025_82)] to-[oklch(0.92_0.06_80)]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[oklch(0.72_0.15_75/0.08)] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-[oklch(0.65_0.16_72/0.06)] blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="shop-header-reveal d1 store-eyebrow inline-flex items-center gap-2">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Category
          </span>

          <h1 className="shop-header-reveal d2 store-h1">{category.name}</h1>

          <p className="shop-header-reveal d3 store-lead max-w-lg text-sm">
            {total} {total === 1 ? "product" : "products"} in this collection.
          </p>

          <div className="shop-header-reveal d4 mt-2 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="store-link text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/shop"
              className="store-link text-muted-foreground transition-colors hover:text-foreground"
            >
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-foreground">{category.name}</span>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <div className="shop-filters-reveal mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ShopProductGrid products={items} />
      </div>
    </div>
  );
}
