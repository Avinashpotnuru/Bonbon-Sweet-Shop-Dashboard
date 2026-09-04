"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
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
import type { Category } from "@/lib/categories-types";
import {
  CategoryForm,
  type CategoryFormValues,
} from "@/components/dashboard/category-form";

type LoadState = "loading" | "success" | "error";

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/categories?search=${encodeURIComponent(search)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setCategories([]);
        }
      });
    return () => controller.abort();
  }, [search, refreshKey]);

  const handleSubmit = useCallback(
    (values: CategoryFormValues) => {
      setFormOpen(false);
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PATCH" : "POST";

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
          setEditingCategory(undefined);
          setRefreshKey((k) => k + 1);
          toast.success(editingCategory ? "Category updated" : "Category created", {
            description: editingCategory
              ? `${values.name} was saved successfully.`
              : `${values.name} was created.`,
          });
        })
        .catch((err) => {
          toast.error("Something went wrong", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editingCategory],
  );

  function confirmDelete() {
    if (!categoryToDelete) return;
    setDeleting(true);

    fetch(`/api/categories/${categoryToDelete.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Delete failed"); });
        return r.json();
      })
      .then(() => {
        const name = categoryToDelete.name;
        setCategoryToDelete(undefined);
        setRefreshKey((k) => k + 1);
        toast.success("Category deleted", {
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
    setEditingCategory(undefined);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search categories by name"
        />
      </div>
      <Button size="sm" onClick={openAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add Category
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
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-md" />
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
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
        <h3 className="font-medium">Failed to load categories</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your categories. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (categories?.length === 0) {
    const hasSearch = search.trim() !== "";
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <PackageX className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">
          {hasSearch ? "No matching categories" : "No categories yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasSearch
            ? "Try a different search term to find what you're looking for."
            : "Add your first category to organize your products."}
        </p>
        {hasSearch ? (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear search
          </Button>
        ) : (
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden="true" />
            Add Category
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
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FolderOpen className="size-4" aria-hidden="true" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.productCount}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Actions for ${category.name}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(category)}>
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setCategoryToDelete(category)}
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {renderToolbar}

      {content}

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setCategoryToDelete(undefined);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {categoryToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
