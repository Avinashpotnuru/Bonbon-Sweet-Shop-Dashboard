"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

type SortDirection = "asc" | "desc";

export function SortButton<TField extends string>({
  field,
  label,
  currentSort,
  onSort,
}: {
  field: TField;
  label: string;
  currentSort: { field: TField; direction: SortDirection };
  onSort: (field: TField) => void;
}) {
  const active = currentSort.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-left font-medium hover:text-foreground transition-colors"
      aria-label={`Sort by ${label}${active ? ` (currently ${currentSort.direction === "asc" ? "ascending" : "descending"})` : ""}`}
    >
      {label}
      {active ? (
        currentSort.direction === "asc" ? (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        )
      ) : null}
    </button>
  );
}