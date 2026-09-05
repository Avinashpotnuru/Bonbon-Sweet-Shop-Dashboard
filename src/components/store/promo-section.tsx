import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  PartyPopper,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Premium promotional feature — "Celebrations, wrapped beautifully."
 *
 * A rich, editorial gifting composition rather than a discount banner: a deep
 * spiced-maroon surface, saffron accents, Playfair headline with an italic
 * accent, a gift-boxes art column, and a perk strip. Motion uses the scoped
 * `hero-reveal` / `hero-float` classes and respects prefers-reduced-motion.
 */
const PERKS = [
  { icon: Gift, title: "Gift boxes", text: "Beautifully finished & ready to give" },
  { icon: PartyPopper, title: "Celebrations", text: "Bespoke boxes for every occasion" },
  { icon: Users, title: "Bulk orders", text: "Weddings, corporate & festive gifting" },
  { icon: Sparkles, title: "Festival sweets", text: "Seasonal collections, made fresh" },
];

export function PromoSection() {
  return (
    <section className="store-section px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2.5rem] bg-[oklch(0.28_0.06_32)] shadow-card">
        {/* Decorative glows */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[oklch(0.72_0.15_75/0.35)] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full bg-[oklch(0.42_0.16_28/0.6)] blur-3xl" />

        {/* Sparkle accents */}
        <Sparkles aria-hidden="true" className="hero-float-slow absolute right-8 top-8 size-6 text-[oklch(0.72_0.15_75)]" />
        <Sparkles aria-hidden="true" className="hero-float absolute bottom-10 left-6 size-4 text-[oklch(0.85_0.09_85/0.6)]" />

        <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:p-14">
          {/* Copy */}
          <div className="flex flex-col items-start gap-6">
            <span className="hero-reveal d1 inline-flex items-center gap-2 rounded-full bg-[oklch(0.85_0.09_85/0.16)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[oklch(0.86_0.11_82)]">
              <Gift className="size-3.5" aria-hidden="true" />
              Celebrations &amp; gifts
            </span>

            <h2 className="hero-reveal d2 max-w-lg font-heading text-[clamp(2rem,4.5vw,3.1rem)] font-bold leading-[1.05] tracking-tight text-[oklch(0.97_0.02_85)]">
              Sweet moments,{" "}
              <span className="italic text-[oklch(0.86_0.11_82)]">wrapped beautifully</span>
            </h2>

            <p className="hero-reveal d3 max-w-md text-base leading-relaxed text-[oklch(0.85_0.03_70)]">
              From festival hampers to bespoke celebration boxes and bulk
              orders, we hand-pack every gift with the same care we bake with.
            </p>

            <div className="hero-reveal d4 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-[oklch(0.78_0.13_70)] px-6 text-base text-[oklch(0.2_0.04_55)] shadow-[0_10px_26px_-8px_oklch(0.78_0.13_70/0.6)] hover:bg-[oklch(0.8_0.13_72)]"
              >
                <Link href="/shop">
                  Shop gifts
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-[oklch(0.9_0.03_75/0.4)] bg-transparent px-6 text-base text-[oklch(0.95_0.02_85)] hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Request a quote</Link>
              </Button>
            </div>
          </div>

          {/* Gift boxes art */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="hero-reveal d3 relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[oklch(0.4_0.09_42)] to-[oklch(0.62_0.13_70)] shadow-2xl ring-1 ring-white/10">
              <Image
                src="/images/gifting-boxes.jpg"
                alt="A Bonbon festival hamper, hand-packed and tied with ribbon"
                fill
                sizes="(max-width: 1024px) 50vw, 30rem"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_50/0.55)] via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-[oklch(0.22_0.04_50/0.55)] px-3 py-1 text-xs font-semibold text-[oklch(0.95_0.02_85)] backdrop-blur-sm ring-1 ring-white/20">
                  <Gift className="size-3.5 text-[oklch(0.86_0.11_82)]" aria-hidden="true" />
                  Hand-tied &amp; gift-ready
                </span>
              </div>
              <div aria-hidden="true" className="hero-reveal d4 hero-float absolute -bottom-4 -left-3 h-16 w-14 -rotate-6 rounded-xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] shadow-lg" />
            </div>
          </div>
        </div>

        {/* Perk strip */}
        <div className="relative border-t border-[oklch(0.9_0.03_75/0.14)]">
          <div className="grid grid-cols-1 divide-y divide-[oklch(0.9_0.03_75/0.12)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {PERKS.map((perk) => (
              <div
                key={perk.title}
                className="hero-reveal d4 flex items-start gap-3 px-8 py-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.14)] text-[oklch(0.86_0.11_82)]">
                  <perk.icon className="size-4" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="font-heading text-sm font-semibold text-[oklch(0.95_0.02_85)]">
                    {perk.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[oklch(0.8_0.03_65)]">
                    {perk.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
