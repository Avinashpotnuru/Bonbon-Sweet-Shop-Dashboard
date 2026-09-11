"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

export function Kpi({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  tone,
  positive = true,
}: {
  label: string;
  value: number;
  delta?: number;
  sub?: string;
  icon: LucideIcon;
  tone: string;
  positive?: boolean;
}) {
  const animated = useCountUp(value);

  return (
    <Card size="sm" className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`inline-flex size-9 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold tracking-tight tabular-nums">
            {formatCurrency(animated)}
          </span>
          {delta !== undefined ? (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {positive ? (
                <TrendingUp className="size-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden="true" />
              )}
              {Math.abs(delta).toFixed(1)}%
              <span className="font-normal text-muted-foreground">this period</span>
            </span>
          ) : (
            sub && <span className="text-xs text-muted-foreground">{sub}</span>
          )}
        </div>
      </CardContent>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </Card>
  );
}