"use client";

import { useState } from "react";
import { BadgeCheck, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/lib/store-data";
import { useCart } from "@/components/store/cart-context";
import { cn } from "@/lib/utils";

/**
 * Interactive product card actions — Add to Cart (with success feedback) and a
 * wishlist toggle. Client component nested inside the Server-rendered card so
 * the card stays SSG-friendly while these two controls stay interactive.
 *
 * Adding a product dispatches into the shared cart (persisted to localStorage).
 * The wishlist is local UI state only for now.
 */
export function ProductCardActions({ product }: { product: StoreProduct }) {
  const { addItem, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  function handleAdd() {
    if (!product.available || added) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`, {
      action: {
        label: "View",
        onClick: () => setOpen(true),
      },
    });
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={!product.available}
        aria-live="polite"
        onClick={handleAdd}
        className={cn(
          "flex-1 gap-1.5 transition-all",
          added && "border-transparent bg-emerald-600 text-white hover:bg-emerald-600",
        )}
      >
        {added ? (
          <>
            <BadgeCheck className="size-4" aria-hidden="true" />
            Added
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" aria-hidden="true" />
            Add to cart
          </>
        )}
      </Button>

      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-pressed={wishlisted}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => setWishlisted((v) => !v)}
        className={cn(
          "shrink-0 border-border text-muted-foreground transition-colors",
          wishlisted &&
            "border-[oklch(0.62_0.13_70)] bg-[oklch(0.72_0.15_75/0.15)] text-[oklch(0.62_0.13_70)]",
        )}
      >
        <Heart
          className={cn(
            "size-4 transition-transform",
            wishlisted && "scale-110 fill-current",
          )}
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}
