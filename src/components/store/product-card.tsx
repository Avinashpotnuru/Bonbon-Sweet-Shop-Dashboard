import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

import type { StoreProduct } from "@/lib/store-data";
import { formatMoneyExact } from "@/lib/format";
import { ProductArt } from "@/components/store/product-art";
import { ProductCardActions } from "@/components/store/product-card-actions";
import { cn } from "@/lib/utils";

const MAX_DESC = 64;

/**
 * Premium product card used on the homepage featured row and the shop grid.
 *
 * Server-rendered shell (image, name, description, price, availability) with a
 * small client island for the Add-to-Cart feedback and wishlist toggle. The
 * whole image is the "View Details" hit area linking into the product page.
 */
export function ProductCard({ product }: { product: StoreProduct }) {
  const lowStock = product.available && product.stock <= 10;
  const description = product.description
    ? product.description.length > MAX_DESC
      ? `${product.description.slice(0, MAX_DESC).trimEnd()}…`
      : product.description
    : undefined;

  return (
    <div className="store-hover-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      {/* Image / View details */}
      <Link
        href={`/shop?product=${product.id}`}
        aria-label={`View ${product.name}`}
        className="store-img-zoom relative block aspect-4/5 w-full overflow-hidden bg-muted"
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <ProductArt name={product.name} className="h-full w-full" />
        )}

        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Badge variant="secondary">Unavailable</Badge>
          </div>
        )}
        {lowStock && (
          <Badge className="absolute left-3 top-3" variant="secondary">
            Almost gone
          </Badge>
        )}

        {/* View details overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Eye className="size-4" aria-hidden="true" />
          <span className="text-sm font-semibold">View details</span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="store-eyebrow text-[0.68rem]">{product.category}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              product.available ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                product.available ? "bg-emerald-500" : "bg-muted-foreground",
              )}
            />
            {product.available ? "In stock" : "Out of stock"}
          </span>
        </div>

        <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/shop?product=${product.id}`} className="store-link">
            {product.name}
          </Link>
        </h3>

        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}

        <span className="mt-auto pt-1 font-heading text-lg font-bold tabular-nums">
          {formatMoneyExact(product.price)}
        </span>

        <ProductCardActions product={product} />
      </div>
    </div>
  );
}
