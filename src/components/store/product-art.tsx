import type { ComponentProps } from "react";

/** Deterministic warm palettes so each product gets stable, appetizing placeholder art. */
const ART_PALETTES = [
  { from: "from-amber-300", to: "to-amber-600", glow: "bg-amber-400/30" },
  { from: "from-orange-300", to: "to-orange-600", glow: "bg-orange-400/30" },
  { from: "from-rose-300", to: "to-rose-600", glow: "bg-rose-400/30" },
  { from: "from-emerald-300", to: "to-emerald-600", glow: "bg-emerald-400/30" },
  { from: "from-orange-400", to: "to-red-600", glow: "bg-red-400/30" },
  { from: "from-yellow-300", to: "to-amber-500", glow: "bg-yellow-400/30" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Shows the first meaningful word of a product name as a centered monogram.
 * Used only as a fallback when a product has no uploaded image.
 */
export function ProductArt({
  name,
  ...props
}: { name: string } & ComponentProps<"div">) {
  const palette = ART_PALETTES[hashString(name) % ART_PALETTES.length];
  const initial = name.trim().split(/\s+/)[0]?.[0]?.toUpperCase() ?? "B";

  return (
    <div
      aria-hidden="true"
      className={`store-art relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${palette.from} ${palette.to}`}
      {...props}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-8 size-28 rounded-full blur-2xl ${palette.glow}`}
      />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-32 rounded-full bg-white/15 blur-2xl" />
      <span className="relative font-heading text-5xl font-bold tracking-tight text-white/90">
        {initial}
      </span>
    </div>
  );
}
