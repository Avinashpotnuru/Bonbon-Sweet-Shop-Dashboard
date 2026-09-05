import { PackageSearch } from "lucide-react";
import type { StoreProduct } from "@/lib/store-data";
import { ProductCard } from "@/components/store/product-card";

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
          <PackageSearch className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-lg font-semibold">No products found</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t find any sweets matching your filters. Try adjusting
            your search or browse a different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-[fade-in-up_0.5s_ease-out_both]"
          style={{ animationDelay: `${Math.min(i, 7) * 55}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
