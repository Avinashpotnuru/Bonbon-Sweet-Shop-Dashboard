import {
  Clock,
  Gem,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

/**
 * "Why Choose Us" — a clean, premium trust strip. Six values with elegant
 * saffron-gold icon medallions, Playfair titles and a soft hover-lift /
 * icon-echo micro-interaction. Restrained surface keeps it airy, not cluttered.
 */
const VALUES = [
  {
    icon: Clock,
    title: "Freshly Prepared",
    text: "Small batches made daily, never stored for days.",
  },
  {
    icon: Gem,
    title: "Premium Ingredients",
    text: "Carefully sourced butter, chocolate and natural flavours.",
  },
  {
    icon: Leaf,
    title: "Authentic Taste",
    text: "Time-honoured recipes with a modern, refined touch.",
  },
  {
    icon: ShieldCheck,
    title: "Hygienic Preparation",
    text: "Clean, certified kitchen with strict food-safety standards.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Safely packed and delivered fresh, right to your door.",
  },
  {
    icon: Sparkles,
    title: "Secure Payments",
    text: "Protected, seamless checkout you can trust.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="store-section-heading mx-auto max-w-2xl items-center text-center">
        <span className="store-eyebrow">Why Bonbon</span>
        <h2 className="store-section-title text-[clamp(1.75rem,3vw,2.25rem)]">
          Crafted with care, delivered with pride
        </h2>
        <p className="store-section-sub mx-auto">
          The details that make every Bonbon treat worth savouring.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {VALUES.map((value) => (
          <div
            key={value.title}
            className="store-hover-lift group flex items-start gap-4 rounded-2xl border bg-card p-5 sm:p-6"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.62_0.13_70)] transition-all duration-300 group-hover:bg-[oklch(0.72_0.15_75/0.9)] group-hover:text-white">
              <value.icon className="size-6" aria-hidden="true" />
            </div>
            <div className="leading-relaxed">
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {value.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{value.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
