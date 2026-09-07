"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Coupon } from "@/lib/coupon-types";
import { CouponForm, type CouponFormValues } from "@/components/dashboard/coupon-form";

type LoadState = "loading" | "success" | "error";

function formatDateShort(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/coupons", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setCoupons(data);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setCoupons([]);
        }
      });
    return () => controller.abort();
  }, [refreshKey]);

  const filteredCoupons = useMemo(() => {
    if (!coupons) return [];
    const query = search.trim().toLowerCase();
    if (!query) return coupons;
    return coupons.filter(
      (c) => c.code.toLowerCase().includes(query) || c.label.toLowerCase().includes(query),
    );
  }, [coupons, search]);

  const handleSubmit = useCallback(
    (values: CouponFormValues) => {
      setFormOpen(false);
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expiresAt: values.expiresAt || null,
          maxUses: values.maxUses || null,
        }),
      })
        .then((r) => {
          if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Request failed"); });
          return r.json();
        })
        .then(() => {
          setEditingCoupon(undefined);
          setRefreshKey((k) => k + 1);
          toast.success(editingCoupon ? "Coupon updated" : "Coupon created", {
            description: editingCoupon
              ? `${values.code} was saved successfully.`
              : `Coupon ${values.code} was created.`,
          });
        })
        .catch((err) => {
          toast.error("Something went wrong", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editingCoupon],
  );

  function confirmDelete() {
    if (!couponToDelete) return;
    setDeleting(true);
    fetch(`/api/coupons/${couponToDelete.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Delete failed"); });
        return r.json();
      })
      .then(() => {
        const code = couponToDelete.code;
        setCouponToDelete(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Coupon deleted", { description: `Coupon ${code} was removed.` });
      })
      .catch((err) => {
        toast.error("Delete failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setDeleting(false));
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search coupons by code or label"
        />
      </div>
      <Button
        size="sm"
        onClick={() => {
          setEditingCoupon(undefined);
          setFormOpen(true);
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add Coupon
      </Button>
    </div>
  );

  let content: React.ReactNode;

  if (loadState === "loading") {
    content = (
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/60 dark:bg-amber-500/5">
              <TableHead>Code</TableHead>
              <TableHead className="hidden sm:table-cell">Label</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="size-6 rounded-md" /></TableCell>
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
        <h3 className="font-medium">Failed to load coupons</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your coupons. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (filteredCoupons.length === 0) {
    const hasSearch = search.trim() !== "";
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <PackageX className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">{hasSearch ? "No matching coupons" : "No coupons yet"}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasSearch
            ? "Try a different search term to find what you're looking for."
            : "Add your first coupon to offer discounts to customers."}
        </p>
        {hasSearch ? (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear search
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setEditingCoupon(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Coupon
          </Button>
        )}
      </div>
    );
  } else {
    content = (
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/60 dark:bg-amber-500/5">
              <TableHead>Code</TableHead>
              <TableHead className="hidden sm:table-cell">Label</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <Badge variant={coupon.active ? "default" : "secondary"} className={coupon.active ? "" : "opacity-70"}>
                    {coupon.code}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {coupon.label}
                </TableCell>
                <TableCell className="hidden md:table-cell font-medium tabular-nums">
                  {coupon.percent}%
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.expiresAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {formatDateShort(coupon.expiresAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="tabular-nums">
                    {coupon.usedCount}
                    {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${coupon.code}`}>
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => { setEditingCoupon(coupon); setFormOpen(true); }}>
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit coupon
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => setCouponToDelete(coupon)}>
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {renderToolbar}
      {content}
      <CouponForm open={formOpen} onOpenChange={setFormOpen} coupon={editingCoupon} onSubmit={handleSubmit} />
      <AlertDialog open={!!couponToDelete} onOpenChange={(open) => { if (!open && !deleting) setCouponToDelete(undefined); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon{" "}
              <span className="font-medium text-foreground">{couponToDelete?.code}</span>?
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