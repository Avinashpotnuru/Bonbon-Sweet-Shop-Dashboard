import {
  formatCurrency,
  formatMoneyCompact,
  formatNumber,
  monthLabel,
} from "@/lib/format";
import type { TrendPoint, GroupTotal } from "@/lib/reports-repo";

export function RevenueArea({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No order data to chart yet.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const W = 100;
  const H = 40;
  const pad = 2;

  const points = data.map((d, i) => {
    const x = pad + (i * (W - pad * 2)) / (data.length - 1);
    const y = H - pad - (d.revenue / max) * (H - pad * 2);
    return { ...d, x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(2)},${H - pad} L${points[0].x.toFixed(2)},${H - pad} Z`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {formatCurrency(total)}
        </span>
        <span className="mb-1 text-xs text-muted-foreground">total revenue</span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label="Revenue trend area chart"
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#revGrad)" />
          <path
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-0">
          {points.map((p) => (
            <div key={p.label} className="text-center">
              <span className="text-xs text-muted-foreground">{monthLabel(p.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const donutPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function StatusDonut({ data }: { data: GroupTotal[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>;
  }
  const w = 120;
  const r = 48;
  const c = 2 * Math.PI * r;

  const segments: (GroupTotal & { color: string; frac: number; offset: number })[] = [];
  let offset = 0;
  for (let i = 0; i < data.length; i += 1) {
    const d = data[i];
    const frac = d.value / total;
    segments.push({ ...d, color: donutPalette[i % donutPalette.length], frac, offset });
    offset += frac;
  }

  const sorted = [...segments].sort((a, b) => b.value - a.value);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${w} ${w}`} className="size-32 -rotate-90">
          <circle
            cx={w / 2}
            cy={w / 2}
            r={r}
            fill="none"
            strokeWidth="16"
            className="stroke-muted"
          />
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx={w / 2}
              cy={w / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.frac * c} ${c}`}
              strokeDashoffset={-seg.offset * c}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{formatNumber(total)}</span>
          <span className="text-[10px] text-muted-foreground">orders</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {sorted.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{seg.name}</span>
            <span className="ml-auto font-medium tabular-nums">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBars({ data }: { data: GroupTotal[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No expenses yet.</p>;
  }
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex flex-col gap-3.5">
      {data.slice(0, 6).map((d, i) => (
        <div key={d.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: donutPalette[i % donutPalette.length] }}
                aria-hidden="true"
              />
              {d.name}
            </span>
            <span className="font-medium tabular-nums">{formatMoneyCompact(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: donutPalette[i % donutPalette.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}