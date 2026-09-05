import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Sparkles, Star } from "lucide-react";

import { CategoryTile } from "@/components/store/category-tile";
import { HeroArt } from "@/components/store/hero-art";
import { ProductGrid } from "@/components/store/product-grid";
import { PromoSection } from "@/components/store/promo-section";
import { Testimonials } from "@/components/store/testimonials";
import { WhyChooseUs } from "@/components/store/why-choose-us";
import { getFeaturedProducts, getStoreCategories } from "@/lib/store-data";

export const metadata: Metadata = {
  title: "Bonbon — Small-Batch Artisan Confectionery",
  description:
    "Premium handmade chocolates, caramels, gummies, and more from the Bonbon confectionery.",
};

export default async function StoreHomePage() {
  const [categories, featured] = await Promise.all([
    getStoreCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8">
          {/* Copy */}
          <div className="flex flex-col items-start gap-6">
            <span className="hero-reveal d1 store-eyebrow inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_75/0.14)] px-3 py-1 text-[0.7rem]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Small-batch &amp; handmade since 2018
            </span>

            <h1 className="hero-reveal d2 store-display">
              Handcrafted sweets for life&apos;s{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
                sweetest
              </span>{" "}
              moments
            </h1>

            <p className="hero-reveal d3 store-lead max-w-lg">
              Premium chocolates, silky caramels and fruity gummies — made
              daily in small batches from natural ingredients, and hand-finished
              in our kitchen.
            </p>

            <div className="hero-reveal d4 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="store-hover-lift h-12 rounded-xl px-6 text-base shadow-cta"
              >
                <Link href="/shop">
                  Shop the collection
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="store-hover-lift h-12 rounded-xl border-[oklch(0.65_0.11_70/0.5)] px-6 text-base text-foreground"
              >
                <Link href="/#story">Explore categories</Link>
              </Button>
            </div>

            {/* Trust row */}
            <div className="hero-reveal d5 flex items-center gap-5 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex text-[oklch(0.62_0.13_70)]" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span>
                  <span className="font-semibold text-foreground">4.9</span>
                  <span className="sr-only"> out of 5 stars from </span>
                  2,300+ reviews
                </span>
              </span>
              <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <Leaf className="size-4 text-[oklch(0.55_0.11_30)]" aria-hidden="true" />
                Fresh &amp; natural
              </span>
            </div>
          </div>

          {/* Visual */}
          <HeroArt />
        </div>
      </section>

      {/* Featured categories */}
      <section className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="store-section-heading flex-row items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="store-eyebrow">Find your favourite</span>
            <h2 className="store-section-title">
              Shop by category
            </h2>
            <p className="store-section-sub text-sm">
              Signature collections crafted for every craving — explore and find
              your new favourite.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="store-link rounded-md px-0 text-primary">
            <Link href="/shop">
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {categories.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="store-section mx-auto w-full max-w-7xl px-4 pt-0 sm:px-6 lg:px-8">
        <div className="store-section-heading flex-row items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="store-eyebrow">Most loved</span>
            <h2 className="store-section-title">
              Featured sweets
            </h2>
            <p className="store-section-sub text-sm">
              A few of our handcrafted treats, chosen this week.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="store-link rounded-md px-0 text-primary">
            <Link href="/shop">
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* Promotional feature */}
      <PromoSection />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
