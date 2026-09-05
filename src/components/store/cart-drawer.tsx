"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductArt } from "@/components/store/product-art";
import { useCart, FREE_SHIPPING_THRESHOLD } from "@/components/store/cart-context";
import { formatMoneyExact } from "@/lib/format";

function CartThumb({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className="size-16 rounded-lg object-cover" />
    );
  }
  return (
    <ProductArt name={name} className="size-16 rounded-lg" />
  );
}

/**
 * Quick-view cart drawer opened from the header icon. Shows line items with
 * quantity steppers, a running subtotal, and CTA to the full cart page.
 */
export function CartDrawer() {
  const { open, setOpen, items, totals, setQuantity, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-heading text-lg">
            <ShoppingBag className="size-5" aria-hidden="true" />
            Your cart
            <span className="text-sm font-normal text-muted-foreground">
              ({totals.count} {totals.count === 1 ? "item" : "items"})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
              <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse our collection and add something sweet.
              </p>
            </div>
            <Button asChild className="mt-1 rounded-xl" onClick={() => setOpen(false)}>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-xl border p-3">
                  <CartThumb name={item.name} image={item.image} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="store-eyebrow text-[0.62rem]">{item.category}</p>
                        <Link
                          href={`/shop?product=${item.productId}`}
                          onClick={() => setOpen(false)}
                          className="store-link line-clamp-2 text-sm font-semibold"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-heading text-sm font-bold tabular-nums">
                        {formatMoneyExact(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free shipping progress */}
              {totals.subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    {formatMoneyExact(FREE_SHIPPING_THRESHOLD - totals.total)} away
                    from free delivery
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-[oklch(0.72_0.15_75)] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (totals.total / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {formatMoneyExact(totals.subtotal)}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-emerald-600 tabular-nums">
                    −{formatMoneyExact(totals.discount)}
                  </span>
                </div>
              )}
              <div className="mb-4 flex items-center justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="font-heading text-lg font-bold tabular-nums">
                  {formatMoneyExact(totals.total)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full rounded-xl" onClick={() => setOpen(false)}>
                  <Link href="/cart">Proceed to checkout</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/shop" className="flex items-center">
                    Continue shopping
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
