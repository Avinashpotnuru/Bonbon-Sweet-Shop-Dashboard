"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Subtle scroll parallax for the hero's decorative background layer only.
 *
 * Pushes a small vertical offset onto `--hero-parallax-y` on its parent so the
 * ornamental wash drifts at a slower rate than the foreground — depth without
 * touching copy or interactive controls. Disabled entirely under
 * `prefers-reduced-motion`, and off when the hero is off-screen to avoid churn.
 *
 * Composition-friendly: only transform/opacity are animated, and updates are
 * coalesced through requestAnimationFrame.
 */
export function HeroParallax({
  children,
  className,
  strength = 24,
}: {
  children: ReactNode;
  className?: string;
  /** Max vertical offset in px the layer drifts as it scrolls through view. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top > vh || rect.bottom < 0) return;
      // Normalized position: 0 at viewport top, 1 at bottom.
      const progress = Math.min(1, Math.max(0, rect.top / vh));
      const y = (progress - 1) * strength;
      (el.parentElement as HTMLElement | null)?.style.setProperty(
        "--hero-parallax-y",
        `${y.toFixed(1)}px`,
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("hero-parallax pointer-events-none", className)}>
      {children}
    </div>
  );
}
