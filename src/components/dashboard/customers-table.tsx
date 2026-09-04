"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CakeSlice,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PackageX,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
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
import type { Customer, CustomerStatus } from "@/lib/customers-types";
import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/dashboard/customer-form";
import { formatMoneyExact } from "@/lib/format";

type SortField = "name" | "email" | "status" | "totalSpent" | "ordersCount" | "joinedAt";
type SortDirection = "asc" | "desc";
type LoadState = "loading" | "success" | "error";

const PAGE_SIZE = 8;

function statusBadgeClasses(status: CustomerStatus) {
  switch (status) {
    case "VIP":
      return "bg-rose-500/15 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800";
    case "Active":
      return "bg-green-500/15 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800";
    case "Inactive":
      return "bg-muted text-muted-foreground border-border dark:bg-white/5 dark:text-muted-foreground dark:border-white/10";
  }
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

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search,
      status: statusFilter,
      sortField: sort.field,
      sortDirection: sort.direction,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    fetch(`/api/customers?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setCustomers(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setCustomers([]);
        }
      });
    return () => controller.abort();
  }, [search, statusFilter, sort, page, refreshKey]);

  const safePage = Math.min(page, totalPages);
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  function handleSort(field: SortField) {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  function handleFilterChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  const handleSubmit = useCallback(
    (values: CustomerFormValues) => {
      setFormOpen(false);
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";
      const method = editingCustomer ? "PATCH" : "POST";

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
          setEditingCustomer(undefined);
          setRefreshKey((k) => k + 1);
          toast.success(editingCustomer ? "Customer updated" : "Customer added", {
            description: editingCustomer
              ? `${values.name} was saved successfully.`
              : `${values.name} was added to your customers.`,
          });
        })
        .catch((err) => {
          toast.error("Something went wrong", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editingCustomer],
  );

  function confirmDelete() {
    if (!customerToDelete) return;
    setDeleting(true);

    fetch(`/api/customers/${customerToDelete.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Delete failed"); });
        return r.json();
      })
      .then(() => {
        const name = customerToDelete.name;
        setCustomerToDelete(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Customer deleted", {
          description: `${name} was removed.`,
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
    setEditingCustomer(undefined);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Search customers by name, email, or city"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" onClick={openAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add Customer
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
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="hidden md:table-cell text-right">Orders</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-8 ml-auto" />
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
        <h3 className="font-medium">Failed to load customers</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your customers. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (customers?.length === 0) {
    const isFiltered = hasActiveFilters;
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <PackageX className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">
          {isFiltered ? "No matching customers" : "No customers yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isFiltered
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Add your first customer to start building your store."}
        </p>
        {isFiltered ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        ) : (
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden="true" />
            Add Customer
          </Button>
        )}
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="name" label="Customer" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">City</TableHead>
                <TableHead>
                  <SortButton field="status" label="Status" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="totalSpent" label="Spent" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  <SortButton field="ordersCount" label="Orders" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                        <CakeSlice className="size-4" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {customer.city || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClasses(customer.status)}>{customer.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoneyExact(customer.totalSpent)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums">
                    {customer.ordersCount}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${customer.name}`}>
                          <MoreHorizontal className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(customer)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setCustomerToDelete(customer)}
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

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} customer{total !== 1 ? "s" : ""} found
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
    <div className="flex flex-col gap-4">
      {renderToolbar}

      {content}

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setCustomerToDelete(undefined);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{customerToDelete?.name}</span>?
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
