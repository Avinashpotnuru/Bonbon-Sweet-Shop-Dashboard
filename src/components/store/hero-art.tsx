import Image from "next/image";
import { Sparkles, Star, BadgeCheck, Leaf } from "lucide-react";

/**
 * Hero visual composition — the "premium product imagery" of the homepage.
 *
 * A layered, high-end still-life: a large "hero plate" backed by real
 * confectionery photography, surrounded by floating trust chips and soft
 * decorative glows. Imagery is served from /public so it never breaks and
 * needs no image-domain configuration.
 *
 * Pure presentational Server Component. Motion is applied via scoped
 * `.hero-reveal` / `.hero-float` classes and respects prefers-reduced-motion.
 */
export function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Decorative background wash — subtle scroll parallax target */}
      <div className="hero-parallax absolute -inset-6 -z-10 lg:-inset-10">
        <div className="absolute right-0 top-0 size-64 rounded-full bg-[oklch(0.72_0.15_75/0.22)] blur-3xl" />
        <div className="absolute bottom-0 left-0 size-52 rounded-full bg-[oklch(0.85_0.09_85/0.28)] blur-3xl" />
      </div>

      {/* Sparkle accents */}
      <Sparkles
        aria-hidden="true"
        className="hero-float-slow absolute -left-4 top-8 size-6 text-[oklch(0.72_0.15_75)]"
      />
      <Sparkles
        aria-hidden="true"
        className="hero-float absolute -right-2 bottom-24 size-4 text-[oklch(0.65_0.16_72)]"
      />

      {/* Main hero plate */}
      <div className="hero-reveal d3 hero-art-card relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[oklch(0.4_0.09_42)] via-[oklch(0.55_0.13_62)] to-[oklch(0.7_0.15_72)] shadow-card">
        <Image
          src="/images/hero-plate.jpg"
          alt="The day's small batch of Bonbon sweets, made fresh"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30rem"
          className="object-cover"
        />
        {/* Scrim so the text stays readable */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(0.28_0.08_45/0.5)] via-transparent to-[oklch(0.22_0.04_50/0.65)]"
        />
        {/* Concentric ring */}
        <div
          aria-hidden="true"
          className="absolute inset-0 m-auto size-[78%] rounded-full border border-white/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 m-auto size-[62%] rounded-full border border-white/15"
        />
        {/* Bonbon centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/5 shadow-lg backdrop-blur-sm ring-1 ring-white/30">
            <span className="font-heading text-5xl font-bold tracking-tight text-white drop-shadow-sm">
              B
            </span>
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight text-white/95">
            Handcrafted daily
          </span>
          <span className="max-w-[15ch] text-sm leading-relaxed text-white/85">
            Small-batch sweets, made fresh in our kitchen
          </span>
        </div>
        {/* Bottom curl accent */}
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/10 blur-2xl"
        />
      </div>

      {/* Floating trust chip — Small batch */}
      <div className="hero-reveal d5 hero-float-slow hero-art-card absolute -left-3 top-6 flex items-center gap-2 rounded-2xl bg-card p-3 pr-4 shadow-card sm:-left-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.42_0.09_45)]">
          <Leaf className="size-4" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-foreground">
            Small batch
          </p>
          <p className="text-xs text-muted-foreground">Every single day</p>
        </div>
      </div>

      {/* Floating trust chip — Rating */}
      <div className="hero-reveal d6 hero-float hero-art-card absolute -bottom-5 right-2 flex items-center gap-2 rounded-2xl bg-card p-3 pr-4 shadow-card sm:-right-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.72_0.15_75/0.25)] text-[oklch(0.62_0.13_70)]">
          <Star className="size-4 fill-current" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tabular-nums text-foreground">
            4.9 <span className="font-medium text-muted-foreground">/ 5</span>
          </p>
          <p className="text-xs text-muted-foreground">
            2,300+ happy clients
          </p>
        </div>
      </div>

      {/* Floating trust chip — Trusted / natural */}
      <div className="hero-reveal d4 hero-float-slow hero-art-card absolute -top-3 right-6 flex items-center gap-1.5 rounded-full bg-[oklch(0.42_0.09_45)] p-2 pl-3 pr-3.5 text-[oklch(0.985_0.012_85)] shadow-md">
        <BadgeCheck className="size-4 text-[oklch(0.72_0.15_75)]" aria-hidden="true" />
        <span className="text-xs font-semibold">100% natural</span>
      </div>
    </div>
  );
}
