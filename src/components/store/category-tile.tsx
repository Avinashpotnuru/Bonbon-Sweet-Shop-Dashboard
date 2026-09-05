import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import type { StoreCategory } from "@/lib/store-data";
import { cn } from "@/lib/utils";

/* Per-category photography lives in /public/images/categories. Any slug
   without a dedicated photo falls back to the generic kitchen shot. */
const CATEGORY_IMAGES: Record<string, string> = {
  "premium-chocolates": "/images/categories/premium-chocolates.jpg",
  caramels: "/images/categories/caramels.jpg",
  gummies: "/images/categories/gummies.jpg",
  lollipops: "/images/categories/lollipops.jpg",
  mints: "/images/categories/mints.jpg",
};

const DEFAULT_CATEGORY_IMAGE = "/images/categories/default.jpg";

function imageFor(slug: string): string {
  return CATEGORY_IMAGES[slug] ?? DEFAULT_CATEGORY_IMAGE;
}

/* Warm, heritage-rooted palette for the modern-Indian aesthetic —
   caramel, kesar saffron, rose/gulab, pistachio, maroon, spice. */
const TILE_GRADIENTS = [
  "from-amber-300 to-amber-600",
  "from-orange-400 to-red-600",
  "from-rose-400 to-rose-700",
  "from-emerald-300 to-emerald-600",
  "from-rose-300 to-rose-600",
  "from-yellow-300 to-amber-500",
  "from-orange-300 to-orange-600",
  "from-lime-300 to-emerald-600",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return TILE_GRADIENTS[Math.abs(hash) % TILE_GRADIENTS.length];
}

/**
 * Featured category card — rich, image-led tile into a category landing page.
 *
 * A full-bleed warm gradient acts as the "art" (products carry no photography
 * yet), finished with a soft glow, a large floating monogram, elegant Playfair
 * type, an item count, and a clear hover-revealed "Explore" CTA. The entire
 * card is a single focusable link for clean keyboard navigation.
 */
export function CategoryTile({
  category,
  className,
}: {
  category: StoreCategory;
  className?: string;
}) {
  const initial = category.name.trim().split(/\s+/)[0]?.[0]?.toUpperCase() ?? "B";
  const monogram = category.name.length <= 12 ? category.name : initial;

  return (
    <Link
      href={`/shop/${category.slug}`}
      className={cn(
        "store-hover-lift group relative flex aspect-4/5 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-sm sm:aspect-3/4",
        className,
      )}
    >
      {/* Art / imagery */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br",
          gradientFor(category.name),
        )}
      />
      <Image
        src={imageFor(category.slug)}
        alt={`${category.name} sweets`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20rem"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      {/* Scrim for text legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.22_0.04_50/0.75)]"
      />
      {/* Soft glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 z-0 size-44 rounded-full bg-white/20 blur-2xl transition-transform duration-700 group-hover:scale-150"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-10 z-0 size-44 rounded-full bg-black/15 blur-2xl"
      />
      {/* Floating monogram */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-6 z-0 select-none font-heading text-[5rem] font-bold leading-none text-white/20"
      >
        {monogram}
      </span>

      {/* Top: count badge */}
      <span className="relative z-10 inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-1 text-[0.7rem] font-medium backdrop-blur-sm ring-1 ring-white/25">
        {category.productCount} {category.productCount === 1 ? "item" : "items"}
      </span>

      {/* Bottom: name + CTA */}
      <div className="relative z-10 flex flex-col gap-2.5">
        <span className="flex items-center justify-between gap-2">
          <span className="font-heading text-xl font-bold leading-tight tracking-tight drop-shadow-sm sm:text-2xl">
            {category.name}
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
          Explore
          <ArrowRight
            className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden="true"
          />
        </span>
      </div>

      {/* Bottom underline accent */}
      <span
        aria-hidden="true"
        className="absolute inset-x-5 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-white/70 transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
