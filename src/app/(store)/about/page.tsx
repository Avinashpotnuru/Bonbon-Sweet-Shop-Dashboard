import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChefHat,
  Gem,
  HeartHandshake,
  Leaf,
  Sparkles,
  Timer,
  Wheat,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Story — Bonbon Small-Batch Confectionery",
  description:
    "Family-run confectionery in Mumbai. Real butter, real chocolate, small batches made daily since 2018 — and what we stand for.",
};

const MILESTONES = [
  {
    year: "2018",
    title: "Our first batch",
    text: "A single copper pot, one caramel recipe and a borrowed shop counter in Mumbai. We sold out before lunch and never really stopped.",
  },
  {
    year: "2020",
    title: "Festival hampers",
    text: "What began as a favour for family became our signature. Gifting boxes, hand-packed and hand-tied, carried Bonbon to weddings and Diwali tables across the city.",
  },
  {
    year: "2023",
    title: "Fresh, door to door",
    text: "We built a small cold-chain delivery network so our sweets arrive the way they left the kitchen — fresh, cool and untouched.",
  },
  {
    year: "Today",
    title: "One kitchen, same promise",
    text: "Batch 4,000 and counting. Every recipe is still tested, tasted and refined by hand, made in small batches and numbered on the box.",
  },
];

const VALUES = [
  {
    icon: Gem,
    title: "Craft",
    text: "Recipes are refined for months before they earn a place on the shelf. Every caramel, truffle and chew is finished by hand.",
  },
  {
    icon: Timer,
    title: "Freshness",
    text: "Made to order in small batches. Most boxes leave the kitchen the very same day they are finished — nothing is warehoused.",
  },
  {
    icon: BadgeCheck,
    title: "Integrity",
    text: "Real butter, real chocolate, natural colour and flavour. If an ingredient needs a research paper on its label, it does not belong in our sweets.",
  },
  {
    icon: HeartHandshake,
    title: "Warmth",
    text: "We pack every order as if it were going to someone we love — because, usually, it is. That changes how carefully we do everything.",
  },
];

const QUALITY_POINTS = [
  "Ingredients we'd put on our own table — AA couverture chocolate, cultured butter, farm eggs and real fruit.",
  "Small batches every day; gentle temperatures, no shortcuts, no preservation tricks.",
  "A batch number on every box, so you can taste exactly the day your sweets were made.",
  "Insulated, cold-chain packaging once the box leaves us — fresh until the seal is broken.",
];

const NUMBERS = [
  { value: "2018", label: "Founded in Mumbai" },
  { value: "4,000+", label: "Batches made and numbered" },
  { value: "40+", label: "Signature recipes" },
  { value: "12", label: "Cities delivered to" },
];

/** Decorative layered plate, matching the hero-art visual language. */
function StoryPlate() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden="true" className="hero-parallax absolute -inset-6 -z-10">
        <div className="absolute right-0 top-6 size-64 rounded-full bg-[oklch(0.72_0.15_75/0.22)] blur-3xl" />
        <div className="absolute bottom-0 left-0 size-52 rounded-full bg-[oklch(0.85_0.09_85/0.28)] blur-3xl" />
      </div>

      <div className="hero-reveal d3 relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[oklch(0.4_0.09_42)] via-[oklch(0.55_0.13_62)] to-[oklch(0.7_0.15_72)] shadow-card">
        <Image
          src="/images/story-kitchen.jpg"
          alt="A fresh batch of hand-made sweets in the Bonbon kitchen"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30rem"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(0.28_0.08_45/0.55)] via-transparent to-[oklch(0.22_0.04_50/0.6)]"
        />
        <div className="absolute inset-0 m-auto size-[78%] rounded-full border border-white/25" />
        <div className="absolute inset-0 m-auto size-[62%] rounded-full border border-white/15" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/5 shadow-lg backdrop-blur-sm ring-1 ring-white/30">
            <ChefHat className="size-10 text-white/90" aria-hidden="true" />
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight text-white/95">
            Born in a Mumbai kitchen
          </span>
          <span className="max-w-[16ch] text-sm leading-relaxed text-white/85">
            One pot, one recipe, and a very long queue
          </span>
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/10 blur-2xl"
        />
      </div>

      <div className="hero-reveal d5 hero-float-slow absolute -left-4 top-8 flex items-center gap-2 rounded-2xl bg-card p-3 pr-4 shadow-card sm:-left-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.42_0.09_45)]">
          <Wheat className="size-4" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-foreground">
            Small batch
          </p>
          <p className="text-xs text-muted-foreground">Made fresh today</p>
        </div>
      </div>

      <div className="hero-reveal d6 hero-float absolute -bottom-5 right-2 flex items-center gap-2 rounded-2xl bg-card p-3 pr-4 shadow-card sm:-right-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.72_0.15_75/0.25)] text-[oklch(0.62_0.13_70)]">
          <Leaf className="size-4" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-foreground">
            All natural
          </p>
          <p className="text-xs text-muted-foreground">Never artificial</p>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      {/* ================================================================
          Hero — editorial split with story intro + stats
      ================================================================ */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 size-80 rounded-full bg-[oklch(0.72_0.15_75/0.12)] blur-3xl" />
          <div className="absolute -bottom-44 -right-24 size-96 rounded-full bg-[oklch(0.85_0.09_85/0.16)] blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-6">
            <span className="shop-header-reveal d1 store-eyebrow inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_75/0.14)] px-3 py-1 text-[0.7rem]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Our story
            </span>

            <h1 className="shop-header-reveal d2 store-display">
              Small-batch sweets, made with{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
                heart &amp; butter
              </span>
            </h1>

            <p className="shop-header-reveal d3 store-lead max-w-xl">
              Bonbon is a family-run confectionery in Mumbai. Since 2018 we have
              made everything the slow way — real butter, real chocolate, real
              fruit — in small batches that are usually gone the day they are
              made.
            </p>

            <div className="shop-header-reveal d4 grid w-full max-w-xl grid-cols-3 gap-6 border-t pt-6">
              {[
                { value: "8", label: "Years of craft" },
                { value: "40+", label: "Signature recipes" },
                { value: "12", label: "Cities delivered" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <StoryPlate />
        </div>
      </section>

      {/* ================================================================
          Story timeline — vertical editorial with numbered rail
      ================================================================ */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <span className="store-eyebrow">How it began</span>
            <h2 className="store-h1">
              From one kitchen to a{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
                citywide favourite
              </span>
            </h2>
            <p className="store-lead">
              A decade of batches, stored in our head and written on the box.
              Each milestone is a promise we kept — and the recipe for the next
              one.
            </p>
          </div>

          <ol className="relative flex flex-col">
            <div
              aria-hidden="true"
              className="absolute left-[1.05rem] top-2 bottom-2 w-px bg-border lg:left-[1.05rem]"
            />
            {MILESTONES.map((milestone, index) => (
              <li key={milestone.year} className="relative flex gap-6 pb-12 last:pb-0 lg:gap-8">
                <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.15_75/0.18)] text-[oklch(0.62_0.13_70)] ring-4 ring-[oklch(0.978_0.014_85)] dark:ring-[oklch(0.185_0.025_50)]">
                  <span className="font-heading text-sm font-bold tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-0.5">
                  <p className="store-eyebrow !text-[0.7rem]">{milestone.year}</p>
                  <h3 className="font-heading text-xl font-bold tracking-tight">
                    {milestone.title}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {milestone.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================
          Values — editorial index list with hairline separators
      ================================================================ */}
      <section className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="store-section-heading max-w-2xl">
          <span className="store-eyebrow">What we stand for</span>
          <h2 className="store-section-title">Values baked into every batch</h2>
          <p className="store-section-sub">
            Four things we check before anything earns the Bonbon name.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {VALUES.map((value, index) => (
            <div
              key={value.title}
              className="group grid items-start gap-x-6 gap-y-3 py-7 sm:grid-cols-[3rem_3rem_1fr] sm:py-8"
            >
              <p className="font-heading text-2xl font-bold tabular-nums text-[oklch(0.72_0.15_75/0.5)] dark:text-[oklch(0.85_0.13_80/0.5)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="flex size-12 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.62_0.13_70)] transition-colors duration-300 group-hover:bg-[oklch(0.72_0.15_75/0.9)] group-hover:text-white">
                <value.icon className="size-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
                  {value.title}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {value.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          Quality & freshness — asymmetric split with art montage
      ================================================================ */}
      <section className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="order-2 flex flex-col gap-6 lg:order-1">
            <span className="store-eyebrow">Quality &amp; freshness</span>
            <h2 className="store-h1">
              Better because it&apos;s{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
                made this morning
              </span>
            </h2>
            <p className="store-lead max-w-xl">
              Great confectionery is a test of patience, and freshness is where
              it shows. Nothing in our kitchen is made more than a day before it
              is enjoyed.
            </p>

            <ul className="mt-2 flex max-w-xl flex-col gap-3">
              {QUALITY_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-card"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.15_75/0.18)] text-[oklch(0.55_0.12_55)]">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {point}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Art montage */}
          <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
            <div className="flex flex-col gap-4 pt-10">
              <div className="store-img-zoom relative overflow-hidden rounded-3xl bg-[oklch(0.4_0.09_42)] shadow-card">
                <Image
                  src="/images/quality-batch.jpg"
                  alt="Freshly finished batch of hand-made sweets, numbered and ready"
                  fill
                  sizes="(max-width: 768px) 45vw, 20rem"
                  className="object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_50/0.85)] via-transparent to-[oklch(0.28_0.08_45/0.25)]" />
                <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-2 p-6 text-center">
                  <Check className="size-7 text-white/90" aria-hidden="true" />
                  <span className="font-heading text-lg font-semibold text-white/95">
                    Batch No. 4,014
                  </span>
                  <span className="text-xs leading-relaxed text-white/80">
                    Made today · 9:40 am
                  </span>
                </div>
              </div>
              <div className="store-img-zoom relative overflow-hidden rounded-3xl bg-[oklch(0.7_0.15_72)] shadow-card">
                <Image
                  src="/images/quality-butter.jpg"
                  alt="Cultured butter from a local dairy used in every batch"
                  fill
                  sizes="(max-width: 768px) 45vw, 20rem"
                  className="object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_50/0.85)] via-transparent to-[oklch(0.28_0.08_45/0.25)]" />
                <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-2 p-6 text-center">
                  <Wheat className="size-7 text-white/90" aria-hidden="true" />
                  <span className="font-heading text-base font-semibold text-white/95">
                    Cultured butter
                  </span>
                  <span className="text-xs text-white/80">
                    From a local dairy
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pb-10">
              <div className="store-img-zoom relative overflow-hidden rounded-3xl bg-[oklch(0.6_0.14_30)] shadow-card">
                <Image
                  src="/images/quality-fruit.jpg"
                  alt="Real fruit, pitted and prepared for the day's batch"
                  fill
                  sizes="(max-width: 768px) 45vw, 20rem"
                  className="object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_50/0.85)] via-transparent to-[oklch(0.28_0.08_45/0.25)]" />
                <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-2 p-6 text-center">
                  <Leaf className="size-7 text-white/90" aria-hidden="true" />
                  <span className="font-heading text-lg font-semibold text-white/95">
                    Real fruit
                  </span>
                  <span className="text-xs leading-relaxed text-white/80">
                    Pectin only. No fake flavours.
                  </span>
                </div>
              </div>
              <div className="store-img-zoom relative overflow-hidden rounded-3xl bg-[oklch(0.22_0.04_50)] shadow-card">
                <Image
                  src="/images/quality-fresh.jpg"
                  alt="Sweets packed for delivery in insulated cold-chain packaging"
                  fill
                  sizes="(max-width: 768px) 45vw, 20rem"
                  className="object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.03_40/0.9)] via-transparent to-transparent" />
                <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-2 p-6 text-center">
                  <Check className="size-7 text-[oklch(0.86_0.11_82)]" aria-hidden="true" />
                  <span className="font-heading text-base font-semibold text-[oklch(0.93_0.02_85)]">
                    Fresh to your door
                  </span>
                  <span className="text-xs text-[oklch(0.75_0.03_65)]">
                    Insulated, cold-chain sealed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Numbers band — full-bleed espresso statement
      ================================================================ */}
      <section className="store-footer-bg">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
            <div className="flex flex-col gap-4">
              <span className="store-eyebrow !text-[oklch(0.8_0.14_75)]">
                Measured in batches
              </span>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-[oklch(0.9_0.02_85)]">
                The small numbers behind a{" "}
                <span className="italic text-[oklch(0.79_0.14_78)]">
                  slow craft
                </span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-[oklch(0.72_0.03_60)]">
                We count everything in batches, not units — because every batch
                gets the same attention whether it serves ten people or ten
                thousand.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {NUMBERS.map((number) => (
                <div
                  key={number.label}
                  className="flex flex-col gap-2 bg-[oklch(0.22_0.04_50)] p-6"
                >
                  <dt className="order-2 text-xs uppercase tracking-wide text-[oklch(0.72_0.03_60)]">
                    {number.label}
                  </dt>
                  <dd className="order-1 font-heading text-3xl font-bold tabular-nums tracking-tight text-[oklch(0.9_0.02_85)]">
                    {number.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ================================================================
          Closing CTA
      ================================================================ */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.72_0.15_75/0.14)] blur-3xl" />
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
          <span className="store-eyebrow">Come taste it</span>
          <h2 className="store-h1 max-w-2xl">
            The sweetest way to believe us is{" "}
            <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
              to take a bite
            </span>
          </h2>
          <p className="store-lead max-w-xl">
            Browse the collection, or talk to us about gifting and bulk orders —
            we love to plan something special.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
              className="store-hover-lift h-12 rounded-xl px-6 text-base text-foreground"
            >
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}