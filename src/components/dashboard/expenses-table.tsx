"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  ReceiptText,
  Search,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Expense, ExpenseCategory } from "@/lib/expenses-types";
import { ExpenseForm, type ExpenseFormValues } from "@/components/dashboard/expense-form";
import { formatDate, formatMoneyExact } from "@/lib/format";
import { SortButton } from "@/components/dashboard/sort-button";
import { TablePagination } from "@/components/dashboard/table-pagination";

type SortField = "description" | "category" | "amount" | "date";
type SortDirection = "asc" | "desc";
type LoadState = "loading" | "success" | "error";

const PAGE_SIZE = 8;

function categoryVariant(category: ExpenseCategory) {
  switch (category) {
    case "Rent":
    case "Salaries":
      return "default" as const; // primary → amber-700
    case "Utilities":
    case "Equipment":
      return "secondary" as const; // green-700
    case "Ingredients":
    case "Packaging":
      return "outline" as const; // lighter amber
    default:
      return "outline" as const; // Marketing, Other
  }
}

export function ExpensesTable() {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "date",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search,
      category: categoryFilter,
      sortField: sort.field,
      sortDirection: sort.direction,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    fetch(`/api/expenses?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setExpenses(data.items);
        setTotal(data.total);
        setTotalSpend(data.totalSpend ?? 0);
        setTotalPages(data.totalPages);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setExpenses([]);
        }
      });
    return () => controller.abort();
  }, [search, categoryFilter, sort, page, refreshKey]);

  const hasActiveFilters = search.trim() !== "" || categoryFilter !== "all";

  function handleSort(field: SortField) {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  function handleFilterChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  const handleSubmit = useCallback(
    (values: ExpenseFormValues) => {
      setFormOpen(false);
      const url = editingExpense
        ? `/api/expenses/${editingExpense.id}`
        : "/api/expenses";
      const method = editingExpense ? "PATCH" : "POST";

      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((r) => {
          if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Request failed"); });
          return r.json();
        })
        .then(() => {
          setEditingExpense(undefined);
          setRefreshKey((k) => k + 1);
          toast.success(editingExpense ? "Expense updated" : "Expense added", {
            description: editingExpense
              ? `${values.description} was saved.`
              : `${values.description} was recorded.`,
          });
        })
        .catch((err) => {
          toast.error("Something went wrong", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editingExpense],
  );

  function confirmDelete() {
    if (!expenseToDelete) return;
    setDeleting(true);

    fetch(`/api/expenses/${expenseToDelete.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Delete failed"); });
        return r.json();
      })
      .then(() => {
        const desc = expenseToDelete.description;
        setExpenseToDelete(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Expense deleted", {
          description: `${desc} was removed.`,
        });
      })
      .catch((err) => {
        toast.error("Delete failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setDeleting(false));
  }

  function openAdd() {
    setEditingExpense(undefined);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Search expenses by description or category"
          />
        </div>
        <Select value={categoryFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Rent">Rent</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
            <SelectItem value="Ingredients">Ingredients</SelectItem>
            <SelectItem value="Packaging">Packaging</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Salaries">Salaries</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" onClick={openAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add Expense
      </Button>
    </div>
  );

  let content: React.ReactNode;

  if (loadState === "loading") {
    content = (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-6 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else if (loadState === "error") {
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">Failed to load expenses</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your expenses. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (expenses?.length === 0) {
    const isFiltered = hasActiveFilters;
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <ReceiptText className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">
          {isFiltered ? "No matching expenses" : "No expenses yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isFiltered
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Record your first expense to start tracking costs."}
        </p>
        {isFiltered ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        ) : (
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden="true" />
            Add Expense
          </Button>
        )}
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
          <div className="flex size-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <Wallet className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total expenses</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatMoneyExact(totalSpend)}
            </span>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {total} expense{total !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="description" label="Description" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton field="category" label="Category" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="amount" label="Amount" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton field="date" label="Date" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="max-w-[260px]">
                    <span className="line-clamp-1 font-medium">{expense.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={categoryVariant(expense.category)}
                      className={
                        expense.category === "Rent" || expense.category === "Salaries"
                          ? "bg-amber-500/15 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300"
                          : expense.category === "Utilities" || expense.category === "Equipment"
                            ? "bg-green-500/15 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400"
                            : ""
                      }
                    >{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-destructive">
                    {formatMoneyExact(expense.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${expense.description}`}>
                          <MoreHorizontal className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(expense)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit expense
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setExpenseToDelete(expense)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          count={total}
          unit="expense"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {renderToolbar}

      {content}

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setExpenseToDelete(undefined);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{expenseToDelete?.description}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
