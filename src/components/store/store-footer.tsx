import Link from "next/link";
import { Candy, LayoutDashboard, Mail, MapPin, Phone } from "lucide-react";

import { NewsletterForm } from "@/components/store/newsletter-form";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Inline SVG social icons (lucide-react has no brand icons)                  */
/* -------------------------------------------------------------------------- */

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const SHOP_LINKS = [
  { label: "All products", href: "/shop" },
  { label: "Premium Chocolates", href: "/shop/premium-chocolates" },
  { label: "Caramels", href: "/shop/caramels" },
  { label: "Gummies", href: "/shop/gummies" },
  { label: "Lollipops", href: "/shop/lollipops" },
  { label: "Mints", href: "/shop/mints" },
];

const COMPANY_LINKS = [
  { label: "Our story", href: "/about" },
  { label: "Why choose us", href: "/#why-choose-us" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/contact" },
];

const POLICY_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Shipping Policy", href: "/shipping" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://x.com", icon: XIcon },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Premium customer-facing footer — dark espresso surface with cream type,
 * warm saffron accents, four-column responsive layout, newsletter, social
 * links, contact info and semantic HTML throughout.
 */
export async function StoreFooter() {
  const session = await getSession();
  const isCustomer = session?.role === "customer";
  return (
    <footer id="contact" className="store-footer-bg">
      {/* Saffron accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[oklch(0.72_0.15_75)] via-[oklch(0.86_0.11_82)] to-[oklch(0.65_0.16_72)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-14 pb-8 sm:px-6 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.3fr] lg:gap-8 lg:px-8">
        {/* ---- Brand + Newsletter ---- */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.72_0.15_75)] to-[oklch(0.62_0.13_70)] text-[oklch(0.25_0.06_50)] shadow-md shadow-primary/20">
              <Candy className="size-5" aria-hidden="true" />
            </div>
            <span className="store-footer-text font-heading text-xl font-bold tracking-tight">
              Bonbon
            </span>
          </Link>

          <p className="store-footer-muted max-w-xs text-sm leading-relaxed">
            Small-batch, handcrafted confectionery made with premium,
            thoughtfully sourced ingredients — fresh from our kitchen to your
            door.
          </p>

          {/* Newsletter */}
          <div className="mt-1">
            <h3 className="store-footer-text mb-2.5 text-sm font-semibold">
              Stay in the loop
            </h3>
            <NewsletterForm />
            <p className="store-footer-muted mt-2 text-[0.7rem]">
              No spam. Just seasonal specials and new arrivals.
            </p>
          </div>
        </div>

        {/* ---- Shop ---- */}
        <nav aria-label="Shop">
          <h3 className="store-footer-text mb-3 text-sm font-semibold">
            Shop
          </h3>
          <ul className="flex flex-col gap-2">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "store-footer-muted text-sm transition-colors",
                    "hover:text-[oklch(0.99_0.01_85)]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- Company + Policies ---- */}
        <div className="flex flex-col gap-8">
          <nav aria-label="Company">
            <h3 className="store-footer-text mb-3 text-sm font-semibold">
              Company
            </h3>
            <ul className="flex flex-col gap-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "store-footer-muted text-sm transition-colors",
                      "hover:text-[oklch(0.99_0.01_85)]",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Policies">
            <h3 className="store-footer-text mb-3 text-sm font-semibold">
              Policies
            </h3>
            <ul className="flex flex-col gap-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "store-footer-muted text-sm transition-colors",
                      "hover:text-[oklch(0.99_0.01_85)]",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ---- Contact + Social ---- */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="store-footer-text mb-3 text-sm font-semibold">
              Get in touch
            </h3>
            <address className="not-italic">
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[oklch(0.72_0.15_75)]" aria-hidden="true" />
                  <span className="store-footer-muted text-sm leading-relaxed">
                    42 Confectionery Lane,<br />
                    Mumbai, Maharashtra 400001
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-[oklch(0.72_0.15_75)]" aria-hidden="true" />
                  <a
                    href="tel:+919876543210"
                    className="store-footer-muted text-sm transition-colors hover:text-[oklch(0.99_0.01_85)]"
                  >
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-[oklch(0.72_0.15_75)]" aria-hidden="true" />
                  <a
                    href="mailto:hello@bonbon.in"
                    className="store-footer-muted text-sm transition-colors hover:text-[oklch(0.99_0.01_85)]"
                  >
                    hello@bonbon.in
                  </a>
                </li>
              </ul>
            </address>
          </div>

          {/* Social */}
          <div>
            <h3 className="store-footer-text mb-3 text-sm font-semibold">
              Follow us
            </h3>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-[oklch(0.72_0.03_60)] transition-colors hover:bg-[oklch(0.72_0.15_75/0.25)] hover:text-[oklch(0.86_0.11_82)]"
                >
                  <social.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="store-footer-text mb-2 text-sm font-semibold">
              Hours
            </h3>
            <p className="store-footer-muted text-sm leading-relaxed">
              Mon – Sat: 10 am – 8 pm<br />
              Sunday: 11 am – 6 pm
            </p>
          </div>
        </div>
      </div>

      {/* ---- Copyright bar ---- */}
      <div className="store-footer-border border-t">
        <div className="store-footer-muted mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} Bonbon Confectionery. All rights
            reserved.
          </span>

          <span className="order-first -mt-1 flex items-center gap-1 sm:order-none sm:mt-0">
            {isCustomer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[0.7rem] font-medium text-[oklch(0.72_0.03_60)]">
                Dashboard is for staff &amp; admins only
              </span>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[0.7rem] font-medium text-[oklch(0.72_0.03_60)] transition-colors hover:border-[oklch(0.72_0.15_75/0.5)] hover:text-[oklch(0.86_0.11_82)]"
              >
                <LayoutDashboard className="size-3" aria-hidden="true" />
                Admin dashboard
              </Link>
            )}
          </span>

          <span className="flex items-center gap-1">
            Crafted by{" "}
            <a
              href="https://avinashpotnuruportfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[oklch(0.82_0.09_85)] underline-offset-2 hover:underline"
            >
              Avinash Potnru
            </a>{" "}
            — one batch at a time.
          </span>
        </div>
      </div>
    </footer>
  );
}