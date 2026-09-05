import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageSquareText,
  Navigation,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/store/contact-form";

export const metadata: Metadata = {
  title: "Contact — Bonbon Small-Batch Confectionery",
  description:
    "Visit our Mumbai kitchen, call, email or send a message. We reply within one working day.",
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Visit the kitchen",
    lines: ["42 Confectionery Lane", "Fort, Mumbai, Maharashtra 400001"],
    href: "https://maps.google.com/?q=42+Confectionery+Lane,+Fort,+Mumbai,+Maharashtra+400001",
    linkText: "Open in Google Maps",
  },
  {
    icon: Phone,
    label: "Call us",
    lines: ["+91 98765 43210"],
    href: "tel:+919876543210",
    linkText: "Call now",
  },
  {
    icon: Mail,
    label: "Email us",
    lines: ["hello@bonbon.in"],
    href: "mailto:hello@bonbon.in",
    linkText: "Write to us",
  },
  {
    icon: Clock,
    label: "Business hours",
    lines: ["Mon – Sat: 10 am – 8 pm", "Sunday: 11 am – 6 pm"],
  },
];

const PROMISES = [
  "We reply within one working day",
  "Fresh, made-to-order — never warehoused",
  "Bulk & gifting enquiries welcome",
];

export default function ContactPage() {
  return (
    <div>
      {/* ================================================================
          Page hero — centered editorial
      ================================================================ */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 size-80 rounded-full bg-[oklch(0.72_0.15_75/0.12)] blur-3xl" />
          <div className="absolute -bottom-44 -right-24 size-96 rounded-full bg-[oklch(0.85_0.09_85/0.16)] blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <span className="shop-header-reveal d1 store-eyebrow inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_75/0.14)] px-3 py-1 text-[0.7rem]">
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            Get in touch
          </span>

          <h1 className="shop-header-reveal d2 store-display">
            We&apos;d love to hear{" "}
            <span className="italic text-[oklch(0.65_0.16_72/0.9)]">from you</span>
          </h1>

          <p className="shop-header-reveal d3 store-lead max-w-xl">
            Questions about an order, a hamper for someone special, or a sweet
            tooth that needs feeding? Drop us a line — a real person reads every
            message.
          </p>
        </div>
      </section>

      {/* ================================================================
          Contact grid — details list + form card
      ================================================================ */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* ---- Details ---- */}
          <div className="flex flex-col gap-4">
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.85_0.09_85/0.5)] text-[oklch(0.62_0.13_70)]">
                  <item.icon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <h2 className="font-heading text-base font-bold tracking-tight">
                    {item.label}
                  </h2>
                  {item.lines.map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {line}
                    </p>
                  ))}
                  {item.href && item.linkText && (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        item.href.startsWith("http") ? "noopener noreferrer" : undefined
                      }
                      className="store-link mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                    >
                      {item.linkText}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              For order updates, please include your order number so we can find
              you quickly.
            </p>
          </div>

          {/* ---- Form ---- */}
          <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
            <span className="store-eyebrow">Send a message</span>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Tell us what you need
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ================================================================
          Location / map — styled "find the kitchen" panel
      ================================================================ */}
      <section className="store-section mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border bg-card shadow-card lg:grid-cols-[1fr_1fr]">
          {/* Copy */}
          <div className="flex flex-col gap-6 p-6 sm:p-10 lg:p-14">
            <span className="store-eyebrow">Find the kitchen</span>
            <h2 className="store-h1">
              Drop by for a{" "}
              <span className="italic text-[oklch(0.65_0.16_72/0.9)]">
                taste &amp; a chat
              </span>
            </h2>
            <p className="store-lead max-w-md">
              Our doors are open most of the week. Walk-ins are welcome, but for
              large pickup orders it helps to call ahead so your batch is ready
              and waiting.
            </p>

            <dl className="flex flex-col gap-3 border-t border-border pt-6">
              {[
                { label: "Address", value: "42 Confectionery Lane, Fort, Mumbai 400001" },
                { label: "Pickup hours", value: "Mon – Sat · 10 am – 8 pm" },
                { label: "Call ahead", value: "+91 98765 43210" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[7rem_1fr] gap-3 text-sm"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>

            <Button
              asChild
              size="lg"
              className="store-hover-lift h-12 w-fit rounded-xl px-6 text-base shadow-cta"
            >
              <Link
                href="https://maps.google.com/?q=42+Confectionery+Lane,+Fort,+Mumbai,+Maharashtra+400001"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get directions
              </Link>
            </Button>
          </div>

          {/* Decorative map card */}
          <div
            aria-hidden="true"
            className="relative min-h-[22rem] overflow-hidden bg-[oklch(0.94_0.03_85)] dark:bg-[oklch(0.21_0.03_50)] [background-image:linear-gradient(to_right,oklch(0.88_0.03_82/0.6)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.88_0.03_82/0.6)_1px,transparent_1px)] [background-size:2.5rem_2.5rem]"
          >
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[oklch(0.72_0.15_75/0.2)] blur-3xl dark:bg-[oklch(0.72_0.15_75/0.25)]" />
            <div className="absolute -bottom-20 -left-10 size-64 rounded-full bg-[oklch(0.85_0.09_85/0.2)] blur-3xl dark:bg-[oklch(0.85_0.13_80/0.15)]" />

            {/* Route line */}
            <svg
              viewBox="0 0 400 300"
              className="absolute inset-0 h-full w-full text-[oklch(0.72_0.15_75/0.55)] dark:text-[oklch(0.79_0.14_78/0.6)]"
              fill="none"
            >
              <path
                d="M40 250 C 90 200, 120 230, 170 170 S 280 90, 320 80"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="1 10"
                strokeLinecap="round"
              />
              <circle cx="40" cy="250" r="6" fill="currentColor" />
            </svg>

            {/* Pin + floating label */}
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
              <div className="hero-float relative flex size-16 items-center justify-center rounded-full bg-[oklch(0.42_0.09_45)] text-[oklch(0.985_0.012_85)] shadow-card">
                <MapPin className="size-7" aria-hidden="true" />
                <div className="absolute left-full top-full h-3 w-3 -translate-x-2/3 -translate-y-1/3 rotate-45 bg-[oklch(0.42_0.09_45)]" />
              </div>
            </div>

            <div className="hero-float-slow absolute right-6 top-8 max-w-[12rem] rounded-2xl bg-card p-3.5 pr-4 shadow-card">
              <p className="font-heading text-sm font-bold tracking-tight text-foreground">
                Bonbon Confectionery
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                42 Confectionery Lane · Mumbai
              </p>
            </div>

            <div className="absolute bottom-6 left-6 rounded-full bg-[oklch(0.72_0.15_75/0.16)] px-3.5 py-1.5 text-xs font-semibold text-[oklch(0.55_0.12_55)] dark:bg-[oklch(0.72_0.15_75/0.25)] dark:text-[oklch(0.85_0.13_80)]">
              Maharashtra · India
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Promise strip
      ================================================================ */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PROMISES.map((promise) => (
            <span
              key={promise}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[oklch(0.72_0.15_75)]"
              />
              {promise}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}