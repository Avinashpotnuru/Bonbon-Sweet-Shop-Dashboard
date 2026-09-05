import "server-only";

import type { SerializableCategory } from "@/lib/categories-repo";
import { listCategories } from "@/lib/categories-repo";
import type { SerializableProduct } from "@/lib/products-repo";
import { fetchProducts } from "@/lib/products-repo";

/**
 * Server-only data access for the customer-facing store.
 *
 * Every selector reuses the existing Admin Dashboard repositories and MongoDB
 * collections. Only `Active` products with available stock are surfaced so
 * drafts and out-of-stock items never reach customers.
 */

export type StoreCategory = SerializableCategory;

export type StoreProduct = SerializableProduct & {
  /** True when the product is available to customers (Active + in stock). */
  available: boolean;
};

type ProductQuery = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

function toStoreProduct(p: SerializableProduct): StoreProduct {
  return {
    ...p,
    available: p.status === "Active" && p.stock > 0,
  };
}

/** All categories ordered by name (reused dashboard selector). */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  return listCategories();
}

/**
 * Browseable catalog. Only active, in-stock products are returned.
 * When a `category` is provided, results are scoped to it.
 */
export async function getStoreProducts(
  query: ProductQuery = {},
): Promise<{ items: StoreProduct[]; total: number }> {
  const result = await fetchProducts({
    search: query.search ?? "",
    category: query.category ?? "all",
    status: "Active",
    sortField: "name",
    sortDirection: "asc",
    page: 1,
    pageSize: 100,
  });

  let items = result.items
    .map(toStoreProduct)
    .filter((p) => p.stock > 0);

  if (typeof query.minPrice === "number") {
    items = items.filter((p) => p.price >= query.minPrice!);
  }
  if (typeof query.maxPrice === "number") {
    items = items.filter((p) => p.price <= query.maxPrice!);
  }

  return { items, total: items.length };
}

/** A curated set of products for the homepage "featured" section. */
export async function getFeaturedProducts(limit = 8): Promise<StoreProduct[]> {
  const result = await fetchProducts({
    search: "",
    category: "all",
    status: "Active",
    sortField: "createdAt",
    sortDirection: "desc",
    page: 1,
    pageSize: 100,
  });

  return result.items
    .map(toStoreProduct)
    .filter((p) => p.stock > 0)
    .slice(0, limit);
}

/** Products belonging to a single category (used on category landing pages). */
export async function getProductsByCategory(
  category: string,
  limit = 12,
): Promise<StoreProduct[]> {
  const result = await fetchProducts({
    search: "",
    category,
    status: "Active",
    sortField: "name",
    sortDirection: "asc",
    page: 1,
    pageSize: 100,
  });

  return result.items
    .map(toStoreProduct)
    .filter((p) => p.stock > 0)
    .slice(0, limit);
}

/** Resolve a category by its slug, returning null when it doesn't exist. */
export async function getCategoryBySlug(
  slug: string,
): Promise<StoreCategory | null> {
  const categories = await listCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}
