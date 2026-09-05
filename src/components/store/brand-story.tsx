import Link from "next/link";
import { ArrowRight, Sparkles, Wheat } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Brand story section — emotional, editorial food-brand storytelling.
 *
 * A warm ivory surface with a decorative grain pattern backdrop, rich
 * Playfair headline with italic accent, origin story copy, three quick
 * "pillars" (craft, freshness, heritage), and a visual column with layered
 * product-art cards. Entrance via `hero-reveal` stagger, reduced-motion safe.
 */
export function BrandStory() {
  return (
    <section id="story" className="relative overflow-hidden">
      {/* Decorative background wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 size-80 rounded-full bg-[oklch(0.72_0.15_75/0.12)] blur-3xl" />
        <div className="absolute -bottom-40 -right-24 size-96 rounded-full bg-[oklch(0.85_0.09_85/0.15)] blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-8">
        {/* Visual */}
        <div className="relative mx-auto hidden w-full max-w-sm lg:block" aria-hidden="true">
          {/* Main plate */}
          <div className="hero-reveal d3 hero-float-slow relative ml-auto aspect-[4/5] w-72 overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[oklch(0.4_0.09_42)] via-[oklch(0.55_0.13_62)] to-[oklch(0.7_0.15_72)] shadow-card">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/5 shadow-lg backdrop-blur-sm ring-1 ring-white/30">
                <Wheat className="size-8 text-white/90" aria-hidden="true" />
              </div>
              <span className="font-heading text-lg font-semibold text-white/95">
                Crafted daily
              </span>
              <span className="text-sm leading-relaxed text-white/80">
                Small-batch perfection
              </span>
            </div>
            <div aria-hidden="true" className="absolute -bottom-12 -left-12 size-44 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Small floating card */}
          <div className="hero-reveal d5 hero-float absolute -left-4 top-10 flex items-center gap-2 rounded-2xl bg-card p-3 pr-4 shadow-card">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.42_0.09_45)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-foreground">
                Natural
              </p>
              <p className="text-xs text-muted-foreground">Only the finest</p>
            </div>
          </div>

          {/* Sparkle accents */}
          <Sparkles aria-hidden="true" className="hero-float-slow absolute -right-3 bottom-16 size-5 text-[oklch(0.65_0.16_72)]" />
        </div>

        {/* Copy */}
        <div className="flex flex-col items-start gap-6">
          <span className="hero-reveal d1 store-eyebrow inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_75/0.14)] px-3 py-1 text-[0.7rem]">
            <Wheat className="size-3.5" aria-hidden="true" />
            Our story
          </span>

          <h2 className="hero-reveal d2 font-heading text-[clamp(2rem,4.5vw,3.1rem)] font-bold leading-[1.05] tracking-tight text-foreground">
            Crafted with care,{" "}
            <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
              since day one
            </span>
          </h2>

          <p className="hero-reveal d3 store-lead max-w-lg">
            Bonbon began with a simple belief: sweets should taste as good as
            they look. Every recipe is tested, refined and hand-finished in our
            kitchen — using natural butter, real chocolate and time-honoured
            techniques, never shortcuts.
          </p>

          <p className="hero-reveal d4 max-w-md text-sm leading-relaxed text-muted-foreground">
            From our first batch of caramels to the festival hampers we pack
            today, the promise is the same: ingredients you can trust, flavours
            you&apos;ll remember, and freshness you can taste in every bite.
          </p>

          {/* Pillars */}
          <div className="hero-reveal d5 flex flex-wrap gap-3 pt-1">
            {[
              { label: "Small-batch", icon: "✦" },
              { label: "Natural ingredients", icon: "✦" },
              { label: "Hand-finished", icon: "✦" },
            ].map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 rounded-full border bg-[oklch(0.985_0.012_85)] px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
              >
                <span aria-hidden="true" className="text-[oklch(0.72_0.15_75)]">
                  {p.icon}
                </span>
                {p.label}
              </span>
            ))}
          </div>

          <div className="hero-reveal d6 flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="store-hover-lift h-12 rounded-xl px-6 text-base shadow-cta"
            >
              <Link href="/contact">
                Get in touch
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="store-hover-lift h-12 rounded-xl px-6 text-base text-foreground"
            >
              <Link href="/shop">Shop now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}