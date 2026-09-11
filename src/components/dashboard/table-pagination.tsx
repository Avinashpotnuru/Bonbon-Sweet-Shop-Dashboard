"use client";

import { Button } from "@/components/ui/button";

export function TablePagination({
  count,
  unit,
  page,
  totalPages,
  onPageChange,
}: {
  count: number;
  unit: "product" | "order" | "customer" | "expense";
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safePage = Math.min(page, totalPages);
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {count} {unit}
        {count !== 1 ? "s" : ""} found
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="tabular-nums">
          Page {safePage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}