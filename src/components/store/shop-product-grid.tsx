"use client";

import { useState } from "react";

import type { StoreProduct } from "@/lib/store-data";
import { ProductGrid } from "@/components/store/product-grid";
import { ShopPagination } from "@/components/store/shop-pagination";

const PAGE_SIZE = 12;

export function ShopProductGrid({
  products,
  initialPage = 1,
}: {
  products: StoreProduct[];
  initialPage?: number;
}) {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = products.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div key={page}>
        <ProductGrid products={paged} />
      </div>
      <ShopPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
