import { Star } from "lucide-react";

/**
 * Customer testimonials — a static, accessible grid rather than a carousel.
 *
 * No auto-advancing movement, so nothing harms usability; entrance uses the
 * scoped `hero-reveal` stagger which is disabled under prefers-reduced-motion.
 * Avatars are warm monogram medallions (no remote portraits to break or leak).
 */
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Birthday order",
    initials: "PS",
    rating: 5,
    testimonial:
      "Ordered a bespoke gift box for my husband’s birthday and the quality blew us away. Every sweet was fresh, elegant and beautifully packed.",
  },
  {
    name: "Arjun Mehta",
    role: "Corporate bulk order",
    initials: "AM",
    rating: 5,
    testimonial:
      "We ran bulk festive gifting through Bonbon — seamless, punctual and the premium packaging made a real impression with our clients.",
  },
  {
    name: "Sneha Iyer",
    role: "Festival hampers",
    initials: "SI",
    rating: 5,
    testimonial:
      "The festival hampers are my new family tradition. Perfect balance of traditional flavours with a refined, modern presentation.",
  },
  {
    name: "Rohan Patel",
    role: "Wedding favours",
    initials: "RP",
    rating: 4,
    testimonial:
      "Beautifully curated wedding favours our guests loved. Would have liked a few more box options, but taste and freshness were spot on.",
  },
  {
    name: "Meera Krishnan",
    role: "Regular customer",
    initials: "MK",
    rating: 5,
    testimonial:
      "You can taste the care in every bite. Consistently fresh, generously portioned and the caramel collection is addictive.",
  },
  {
    name: "Aditi Rao",
    role: "Gift subscription",
    initials: "AR",
    rating: 5,
    testimonial:
      "Sent a monthly box to my sister across the city — arriving fresh every time. The packaging alone feels like a present in itself.",
  },
];

const AVATAR_GRADIENTS = [
  "from-amber-300 to-amber-600",
  "from-rose-400 to-rose-700",
  "from-emerald-300 to-emerald-600",
  "from-orange-400 to-red-600",
  "from-rose-300 to-rose-600",
  "from-yellow-300 to-amber-500",
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-4 text-[oklch(0.62_0.13_70)]" : "size-4 text-muted-foreground/30"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="store-section-heading mx-auto max-w-2xl items-center text-center">
        <span className="store-eyebrow">Kind words</span>
        <h2 className="store-section-title text-[clamp(1.75rem,3vw,2.25rem)]">
          Loved by our customers
        </h2>
        <p className="store-section-sub mx-auto">
          Real notes from the people who make, order and gift our sweets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`hero-reveal d${Math.min((i % 3) + 2, 6)} store-hover-lift flex flex-col rounded-2xl border bg-card p-6`}
          >
            {/* Big decorative quote */}
            <span
              aria-hidden="true"
              className="font-heading text-6xl leading-none text-[oklch(0.72_0.15_75/0.4)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              &ldquo;
            </span>

            <Stars rating={t.rating} />

            <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-foreground/90">
              {t.testimonial}
            </blockquote>

            <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
              <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} font-heading text-sm font-bold text-white`}
              >
                {t.initials}
              </span>
              <div className="leading-tight">
                <p className="font-heading text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}