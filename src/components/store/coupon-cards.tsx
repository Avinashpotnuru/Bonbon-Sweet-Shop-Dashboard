"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coupon } from "@/lib/coupon-types";

type LoadState = "loading" | "success" | "error";

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Premium coupon cards shown in the cart/checkout so customers can discover
 * and apply active offers with one click. Ticket-style layout: a fixed-weight
 * discount face on the left separated by a perforation line, then the offer
 * details and a stable apply action. Aluminum/cream brand palette via design
 * tokens; responsive one-per-row stack for the narrow order summary.
 */
export function CouponCards({
  appliedCode,
  onApply,
  compact = false,
}: {
  appliedCode?: string | null;
  onApply: (code: string) => void | Promise<unknown>;
  compact?: boolean;
}) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/coupons/active", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Coupon[]) => {
        setCoupons(data);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setLoadState("error");
      });
    return () => controller.abort();
  }, []);

  const handleApply = useCallback(
    async (code: string) => {
      setApplying(code);
      try {
        const result = (await onApply(code)) as
          | { ok: boolean; message: string }
          | void
          | undefined;
        if (result && typeof result === "object") {
          if (result.ok) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        }
      } finally {
        setApplying(null);
      }
    },
    [onApply],
  );

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied", { description: `${code} was copied to your clipboard.` });
    } catch {
      // clipboard unavailable — ignore
    }
  }, []);

  if (loadState === "error") return null;

  if (loadState === "loading") {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (coupons.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="size-3.5 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
        Available offers
      </p>
      <div className="flex flex-col gap-2.5">
        {coupons.map((coupon) => {
          const isApplied = appliedCode === coupon.code;
          return (
            <CouponTicket
              key={coupon.id}
              coupon={coupon}
              compact={compact}
              isApplied={isApplied}
              applying={applying === coupon.code}
              onApply={() => handleApply(coupon.code)}
              onCopy={() => copyCode(coupon.code)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CouponTicket({
  coupon,
  compact,
  isApplied,
  applying,
  onApply,
  onCopy,
}: {
  coupon: Coupon;
  compact: boolean;
  isApplied: boolean;
  applying: boolean;
  onApply: () => void;
  onCopy: () => void;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border shadow-sm",
        "bg-card transition-colors",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        isApplied
          ? "border-[oklch(0.62_0.13_70/0.55)] ring-1 ring-[oklch(0.62_0.13_70/0.25)]"
          : "border-border hover:border-[oklch(0.62_0.13_70/0.35)]",
      ].join(" ")}
    >
      <div className="flex items-stretch gap-3">
        {/* Discount face */}
        <div
          className={[
            "flex w-14 shrink-0 items-center justify-center rounded-lg",
            "bg-gradient-to-br from-[oklch(0.55_0.12_45)] to-[oklch(0.42_0.09_45)]",
            "text-white",
          ].join(" ")}
        >
          <div className="flex flex-col items-center gap-0 px-1 text-center">
            <span className="flex items-center gap-0.5 font-heading leading-none">
              <span className="text-lg font-extrabold tabular-nums">
                {coupon.percent}
              </span>
              <span className="text-sm font-bold">%</span>
            </span>
            <span className="text-[0.5rem] font-medium uppercase tracking-wider text-white/80">
              OFF
            </span>
          </div>
        </div>

        {/* Perforation separator — real flex column so it always aligns */}
        <div className="relative flex shrink-0 flex-col items-center justify-center py-1">
          <div className="h-full w-px border-l border-dashed border-[oklch(0.62_0.13_70/0.35)]" />
          <span className="absolute -top-1.5 size-3 rounded-full border border-border bg-card" />
          <span className="absolute -bottom-1.5 size-3 rounded-full border border-border bg-card" />
        </div>

        {/* Offer body */}
        <div className="min-w-0 flex-1 self-center">
          <p className="truncate font-heading text-[0.8rem] font-bold leading-tight text-foreground">
            {coupon.label || `${coupon.percent}% off`}
          </p>
          <button
            type="button"
            onClick={onCopy}
            className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold tracking-widest text-foreground transition-colors hover:bg-secondary"
            title="Copy code"
            aria-label={`Copy coupon code ${coupon.code}`}
          >
            <Tag className="size-2.5 text-[oklch(0.62_0.13_70)]" aria-hidden="true" />
            <span className="truncate">{coupon.code}</span>
            <Copy className="size-2.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
          {coupon.expiresAt && (
            <p className="mt-0.5 text-[0.66rem] leading-none text-muted-foreground">
              Valid until {formatExpiry(coupon.expiresAt)}
            </p>
          )}
        </div>

        {/* Action */}
        <Button
          type="button"
          size="xs"
          variant={isApplied ? "outline" : "default"}
          className="w-20 shrink-0 self-center rounded-lg"
          disabled={applying || isApplied}
          onClick={onApply}
        >
          {isApplied ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              Applied
            </>
          ) : applying ? (
            "Applying…"
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
}