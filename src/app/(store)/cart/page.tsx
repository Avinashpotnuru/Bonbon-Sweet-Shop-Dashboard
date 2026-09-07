"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ProductArt } from "@/components/store/product-art";
import { CouponCards } from "@/components/store/coupon-cards";
import { useCart } from "@/components/store/cart-context";
import { formatMoneyExact } from "@/lib/format";

function CartThumb({ name, image }: { name: string; image?: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="size-20 rounded-xl object-cover" />;
  }
  return <ProductArt name={name} className="size-20 rounded-xl" />;
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totals,
    appliedPromo,
    setQuantity,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");

  const handleApplyPromo = async () => {
    const result = await applyPromo(promoInput);
    if (result.ok) {
      setPromoInput("");
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const empty = items.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="store-link transition-colors hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-foreground">Cart</span>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <span className="store-eyebrow">Your selection</span>
        <h1 className="store-h1">Shopping cart</h1>
        {!empty && (
          <p className="text-sm text-muted-foreground">
            {totals.count} {totals.count === 1 ? "item" : "items"} in your cart
          </p>
        )}
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border bg-card py-24 text-center shadow-card">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted/60">
            <ShoppingBag className="size-9 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-xl font-bold">Your cart is empty</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              You haven&apos;t added any sweets yet. Explore our handcrafted
              collection and treat yourself.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/shop">
              Continue shopping
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          {/* Line items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group flex gap-4 rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="shrink-0">
                  <CartThumb name={item.name} image={item.image} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="store-eyebrow text-[0.62rem]">
                        {item.category}
                      </span>
                      <Link
                        href={`/shop?product=${item.productId}`}
                        className="store-link block truncate font-heading text-base font-semibold"
                      >
                        {item.name}
                      </Link>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {formatMoneyExact(item.price)} each
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground opacity-70 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="inline-flex items-center rounded-lg border">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-medium tabular-nums"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="font-heading text-lg font-bold tabular-nums">
                      {formatMoneyExact(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="self-start text-sm font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-destructive hover:underline"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-heading text-lg font-bold">Order summary</h2>

            {/* Promo code */}
            <div className="mb-5 flex flex-col gap-3">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-foreground">
                    <Tag className="size-4" aria-hidden="true" />
                    {appliedPromo} applied
                  </span>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Remove promo code"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      placeholder="Enter coupon code"
                      className="h-9 pl-9"
                      aria-label="Coupon code"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-lg"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </Button>
                </div>
              )}

              <CouponCards appliedCode={appliedPromo} onApply={applyPromo} />
            </div>

            <Separator className="mb-4" />

            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold tabular-nums">
                  {formatMoneyExact(totals.subtotal)}
                </dd>
              </div>

              {totals.discount > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">
                    Discount{appliedPromo ? ` (${appliedPromo})` : ""}
                  </dt>
                  <dd className="font-medium text-emerald-600 tabular-nums dark:text-emerald-500">
                    −{formatMoneyExact(totals.discount)}
                  </dd>
                </div>
              )}

              <div className="flex items-center justify-between">
                <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="size-4" aria-hidden="true" />
                  Delivery
                </dt>
                <dd className="font-semibold tabular-nums">
                  {totals.delivery === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-500">Free</span>
                  ) : (
                    formatMoneyExact(totals.delivery)
                  )}
                </dd>
              </div>
            </dl>

            <Separator className="my-4" />

            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-base font-bold">Total</span>
              <span className="font-heading text-2xl font-bold tabular-nums">
                {formatMoneyExact(totals.total)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="lg" className="w-full rounded-xl" onClick={() => router.push("/checkout")}>
                Proceed to checkout
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full rounded-xl">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
