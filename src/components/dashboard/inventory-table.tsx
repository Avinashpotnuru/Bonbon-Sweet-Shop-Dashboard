"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ChevronDown,
  ChevronUp,
  PackageX,
  PackagePlus,
  RotateCcw,
  Search,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  InventoryItem,
  InventorySummary,
  StockLevel,
  StockMovementItem,
} from "@/lib/inventory-types";
import {
  AdjustStockDialog,
  type AdjustFormValues,
} from "@/components/dashboard/inventory-adjust-dialog";
import { formatMoneyExact } from "@/lib/format";

type SortField = "name" | "sku" | "category" | "price" | "stock";
type SortDirection = "asc" | "desc";
type LoadState = "loading" | "success" | "error";

const PAGE_SIZE = 8;

function levelVariant(level: StockLevel) {
  switch (level) {
    case "in":
      return "default" as const;
    case "low":
      return "outline" as const;
    case "out":
      return "destructive" as const;
  }
}

function StockCell({ stock }: { stock: number }) {
  const level = stock <= 0 ? "out" : stock <= 10 ? "low" : "in";
  const tone =
    level === "out"
      ? "text-red-700 dark:text-red-400"
      : level === "low"
        ? "text-amber-700 dark:text-amber-300"
        : "text-green-700 dark:text-green-400";
  return (
    <span className={`font-medium tabular-nums ${tone}`}>
      {stock} {level === "low" && <span className="text-xs text-amber-700 dark:text-amber-300">(low)</span>}
    </span>
  );
}

function SortButton({
  field,
  label,
  currentSort,
  onSort,
}: {
  field: SortField;
  label: string;
  currentSort: { field: SortField; direction: SortDirection };
  onSort: (field: SortField) => void;
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

function summaryCards(summary: InventorySummary) {
  const cards = [
    {
      label: "Products",
      value: String(summary.productCount),
      sub: `${summary.totalUnits} units`,
      icon: Boxes,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "In stock",
      value: String(summary.productCount - summary.lowCount - summary.outCount),
      sub: "Healthy levels",
      icon: PackagePlus,
      tone: "text-green-600 bg-green-600/10 dark:text-green-400 dark:bg-green-500/15",
    },
    {
      label: "Low stock",
      value: String(summary.lowCount),
      sub: "Need replenishment",
      icon: TriangleAlert,
      tone: "text-amber-700 bg-amber-500/10 dark:text-amber-300 dark:bg-amber-500/15",
    },
    {
      label: "Out of stock",
      value: String(summary.outCount),
      sub: "Unavailable",
      icon: PackageX,
      tone: "text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15",
    },
    {
      label: "Inventory value",
      value: formatMoneyExact(summary.totalValue),
      sub: "At retail price",
      icon: Wallet,
      tone: "text-primary bg-primary/10",
    },
  ];
  return cards;
}

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [summary, setSummary] = useState<InventorySummary>({
    productCount: 0,
    totalUnits: 0,
    totalValue: 0,
    lowCount: 0,
    outCount: 0,
  });
  const [movements, setMovements] = useState<StockMovementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search,
      level: levelFilter,
      sortField: sort.field,
      sortDirection: sort.direction,
      page: String(page),
      pageSize: String(PAGE_SIZE),
      movements: "true",
    });
    fetch(`/api/inventory?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setItems(data.items);
        setSummary(data.summary);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setMovements(data.movements ?? []);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setItems([]);
        }
      });
    return () => controller.abort();
  }, [search, levelFilter, sort, page, refreshKey]);

  const safePage = Math.min(page, totalPages);
  const hasActiveFilters = search.trim() !== "" || levelFilter !== "all";

  function handleSort(field: SortField) {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  function handleFilterChange(value: string) {
    setLevelFilter(value);
    setPage(1);
  }

  function openAdjust(item: InventoryItem) {
    setAdjustingItem(item);
    setAdjustOpen(true);
  }

  function handleSubmit(values: AdjustFormValues) {
    if (!adjustingItem) return;
    setSubmitting(true);

    fetch(`/api/inventory/${adjustingItem.id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Adjustment failed"); });
        return r.json();
      })
      .then((data) => {
        const verb = values.type === "in" ? "added" : "removed";
        setAdjustOpen(false);
        setRefreshKey((k) => k + 1);
        if (data.clamped) {
          toast.warning("Stock capped at zero", {
            description: `${adjustingItem.name} reached 0 and is now out of stock.`,
          });
        } else {
          toast.success("Stock adjusted", {
            description: `${values.change} ${values.change === 1 ? "unit" : "units"} ${verb} for ${adjustingItem.name}.`,
          });
        }
      })
      .catch((err) => {
        toast.error("Adjustment failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setSubmitting(false));
  }

  const cards = summaryCards(summary);

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by product or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Search inventory by product or SKU"
          />
        </div>
        <Select value={levelFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by stock level">
            <SelectValue placeholder="Stock level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="in">In stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSummary = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col gap-2 rounded-lg border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <div className={`inline-flex size-7 items-center justify-center rounded-md ${card.tone}`}>
              <card.icon className="size-4" />
            </div>
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tabular-nums">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMovements = (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Recent stock movements</h3>
      </div>
      <div className="flex flex-col divide-y">
        {movements.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No stock adjustments recorded yet.
          </p>
        ) : (
          movements.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                  m.type === "in"
                    ? "bg-green-600/10 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                }`}
              >
                {m.type === "in" ? (
                  <ArrowDownToLine className="size-4" aria-hidden="true" />
                ) : (
                  <ArrowUpFromLine className="size-4" aria-hidden="true" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{m.productName}</span>
                <span className="text-xs text-muted-foreground">
                  {m.sku} · {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <Badge
                variant={m.type === "in" ? "secondary" : "outline"}
                className="tabular-nums"
              >
                {m.type === "in" ? "+" : ""}
                {m.change}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );

  let tableContent: React.ReactNode;

  if (loadState === "loading") {
    tableContent = (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">Adjust</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-7 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else if (loadState === "error") {
    tableContent = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">Failed to load inventory</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your inventory. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (items?.length === 0) {
    tableContent = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Boxes className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">
          {hasActiveFilters ? "No matching products" : "No inventory yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Try adjusting your search or stock-level filter."
            : "Add products in the Products section to start managing stock."}
        </p>
        {hasActiveFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setLevelFilter("all");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        ) : (
          <Button size="sm" asChild>
            <a href="/dashboard/products">
              <PackagePlus className="size-4" aria-hidden="true" />
              Go to Products
            </a>
          </Button>
        )}
      </div>
    );
  } else {
    tableContent = (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="name" label="Product" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton field="category" label="Category" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="price" label="Price" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="stock" label="Stock" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Adjust</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoneyExact(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <StockCell stock={item.stock} />
                      <Badge variant={levelVariant(item.level)}>{item.level}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdjust(item)}
                    >
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} product{total !== 1 ? "s" : ""} found
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {renderSummary}
        {renderToolbar}
        {tableContent}
        {renderMovements}
      </div>

      <AdjustStockDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        item={adjustingItem}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </>
  );
}
