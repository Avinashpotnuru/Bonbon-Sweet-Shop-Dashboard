"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PackageX,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  TriangleAlert,
  XOctagon,
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
import type { Order, OrderStatus } from "@/lib/orders-types";
import { OrderForm, type OrderFormValues } from "@/components/dashboard/order-form";
import { formatDate, formatMoneyExact } from "@/lib/format";

type SortField = "orderNumber" | "customerName" | "itemCount" | "total" | "status" | "placedAt";
type SortDirection = "asc" | "desc";
type LoadState = "loading" | "success" | "error";

const PAGE_SIZE = 8;

function statusBadgeClasses(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return "bg-green-500/15 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800";
    case "Paid":
      return "bg-amber-500/15 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800";
    case "Shipped":
      return "bg-amber-500/15 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800";
    case "Pending":
      return "bg-muted text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-800";
    case "Cancelled":
      return "bg-red-500/15 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800";
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

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "placedAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [orderToDelete, setOrderToDelete] = useState<Order | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  const [orderToCancel, setOrderToCancel] = useState<Order | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);

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
    fetch(`/api/orders?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setOrders(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setOrders([]);
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
    (values: OrderFormValues) => {
      setFormOpen(false);
      const url = editingOrder
        ? `/api/orders/${editingOrder.id}`
        : "/api/orders";
      const method = editingOrder ? "PATCH" : "POST";

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
          setEditingOrder(undefined);
          setRefreshKey((k) => k + 1);
          toast.success(editingOrder ? "Order updated" : "Order created", {
            description: editingOrder
              ? `${values.customerName}'s order was saved.`
              : `Order created for ${values.customerName}.`,
          });
        })
        .catch((err) => {
          toast.error("Something went wrong", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editingOrder],
  );

  function confirmDelete() {
    if (!orderToDelete) return;
    setDeleting(true);

    fetch(`/api/orders/${orderToDelete.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Delete failed"); });
        return r.json();
      })
      .then(() => {
        const num = orderToDelete.orderNumber;
        setOrderToDelete(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Order deleted", {
          description: `Order ${num} was removed.`,
        });
      })
      .catch((err) => {
        toast.error("Delete failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setDeleting(false));
  }

  function confirmCancel() {
    if (!orderToCancel) return;
    setCancelling(true);

    fetch(`/api/orders/${orderToCancel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Cancel failed"); });
        return r.json();
      })
      .then(() => {
        const num = orderToCancel.orderNumber;
        setOrderToCancel(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Order cancelled", {
          description: `Order ${num} has been cancelled. Stock has been restored.`,
        });
      })
      .catch((err) => {
        toast.error("Cancel failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setCancelling(false));
  }

  function openAdd() {
    setEditingOrder(undefined);
    setFormOpen(true);
  }

  function openEdit(order: Order) {
    setEditingOrder(order);
    setFormOpen(true);
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by order or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Search orders by order number or customer"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" onClick={openAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add Order
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
              <TableHead>Order</TableHead>
              <TableHead className="hidden sm:table-cell">Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
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
        <h3 className="font-medium">Failed to load orders</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your orders. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (orders?.length === 0) {
    const isFiltered = hasActiveFilters;
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <PackageX className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">
          {isFiltered ? "No matching orders" : "No orders yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isFiltered
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Create your first order to start tracking sales."}
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
            Add Order
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
                  <SortButton field="orderNumber" label="Order" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton field="customerName" label="Customer" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton field="status" label="Status" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  <SortButton field="itemCount" label="Items" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="total" label="Total" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton field="placedAt" label="Placed" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ShoppingBag className="size-4" aria-hidden="true" />
                      </div>
                      <span className="font-medium tabular-nums">{order.orderNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClasses(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums">
                    {order.itemCount}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoneyExact(order.total)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {formatDate(order.placedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${order.orderNumber}`}>
                          <MoreHorizontal className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(order)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit order
                        </DropdownMenuItem>
                        {order.status !== "Cancelled" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setOrderToCancel(order)}>
                              <XOctagon className="size-4" aria-hidden="true" />
                              Cancel order
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setOrderToDelete(order)}
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
            {total} order{total !== 1 ? "s" : ""} found
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

      <OrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editingOrder}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setOrderToDelete(undefined);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{" "}
              <span className="font-medium text-foreground">{orderToDelete?.orderNumber}</span>?
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

      <AlertDialog
        open={!!orderToCancel}
        onOpenChange={(open) => {
          if (!open && !cancelling) setOrderToCancel(undefined);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-amber-500/10 text-amber-600">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark{" "}
              <span className="font-medium text-foreground">{orderToCancel?.orderNumber}</span>{" "}
              as Cancelled and restore its items to inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={cancelling}>
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
