"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Banknote,
  IndianRupee,
  Lock,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CartItemThumb } from "@/components/store/cart-item-thumb";
import { CouponCards } from "@/components/store/coupon-cards";
import { checkoutSchema, PAYMENT_METHODS, type CheckoutInput } from "@/lib/checkout-schemas";
import { createRazorpayCheckout, placeOrder } from "@/components/store/checkout-actions";
import { useCart } from "@/components/store/cart-context";
import { ORDER_STORAGE_KEY, type PlacedOrder } from "@/lib/placed-order";
import type { RazorpayPublicConfig } from "@/lib/razorpay";
import { formatMoneyExact } from "@/lib/format";

type CheckoutPayload = CheckoutInput & {
  promoCode: string;
  items: Array<{ productId: string; quantity: number }>;
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayPaymentResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined" || "Razorpay" in window) {
    return Promise.resolve();
  }
  razorpayScriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load the Razorpay checkout script."));
    };
  });
  return razorpayScriptPromise;
}

export function CheckoutForm({
  razorpay,
}: {
  razorpay?: RazorpayPublicConfig | null;
}) {
  const router = useRouter();
  const { items, totals, appliedPromo, applyPromo, clearCart } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      notes: "",
      paymentMethod: "Cash on Delivery",
    },
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  function finishOrder(order: PlacedOrder) {
    clearCart();
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    router.replace("/order-success");
  }

  function handleFailure(
    result: { ok: false; error: string; code?: string },
  ) {
    if (result.code === "LOGIN_REQUIRED") {
      router.replace("/login?next=/checkout");
      return;
    }
    setServerError(result.error);
  }

  function openRazorpay(
    payment: { id: string; amount: number; currency: string },
    checkoutInput: CheckoutPayload,
  ) {
    if (!razorpay) return;
    setServerError(null);

    const instance = new window.Razorpay!({
      key: razorpay.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Bonbon",
      description: "Sweet Shop order",
      order_id: payment.id,
      prefill: {
        name: checkoutInput.customerName,
        email: checkoutInput.email,
        contact: checkoutInput.phone,
      },
      modal: {
        ondismiss: () => setServerError(null),
      },
      handler: async (response) => {
        const result = await placeOrder({
          ...checkoutInput,
          razorpay: {
            orderId: payment.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          },
        });
        if (!result.ok) {
          handleFailure(result);
          return;
        }
        finishOrder(result.order);
      },
    });
    instance.open();
  }

  async function onSubmit(values: CheckoutInput) {
    setServerError(null);
    const itemsPayload = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    if (itemsPayload.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }

    const checkoutInput: CheckoutPayload = {
      ...values,
      promoCode: appliedPromo ?? "",
      items: itemsPayload,
    };

    if (values.paymentMethod !== "Razorpay") {
      const result = await placeOrder(checkoutInput);
      if (!result.ok) {
        handleFailure(result);
        return;
      }
      finishOrder(result.order);
      return;
    }

    const setup = await createRazorpayCheckout(checkoutInput);
    if (!setup.ok) {
      handleFailure(setup);
      return;
    }

    try {
      await loadRazorpayScript();
    } catch {
      setServerError("We couldn't load the payment provider. Please try again.");
      return;
    }

    openRazorpay(setup.razorpay, checkoutInput);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border bg-card px-6 py-20 text-center shadow-card">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
          <Truck className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-xl font-bold">Nothing to check out</h2>
          <p className="text-sm text-muted-foreground">
            Your cart is empty. Add some sweets before heading to checkout.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/shop">
            Continue shopping
            <ArrowLeft className="ml-2 size-4 rotate-180" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_24rem]"
    >
      {/* ── Details column ── */}
      <div className="flex flex-col gap-8">
        {/* Contact */}
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-5 font-heading text-lg font-bold">Contact details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel required>Full name</FieldLabel>
              <FieldContent>
                <Input placeholder="Priya Sharma" {...register("customerName")} />
                <FieldError errors={[errors.customerName]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel required>Phone number</FieldLabel>
              <FieldContent>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                />
                <FieldError errors={[errors.phone]} />
              </FieldContent>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel required>Email address</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>
          </div>
        </section>

        {/* Delivery address */}
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-5 font-heading text-lg font-bold">Delivery address</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel required>Address line 1</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Apartment, street, landmark"
                  autoComplete="address-line1"
                  {...register("addressLine1")}
                />
                <FieldError errors={[errors.addressLine1]} />
              </FieldContent>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel>Address line 2 (optional)</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Building, floor, suite"
                  autoComplete="address-line2"
                  {...register("addressLine2")}
                />
                <FieldError errors={[errors.addressLine2]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel required>City</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Mumbai"
                  autoComplete="address-level2"
                  {...register("city")}
                />
                <FieldError errors={[errors.city]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>State / Region</FieldLabel>
              <FieldContent>
                <Input placeholder="Maharashtra" {...register("state")} />
                <FieldError errors={[errors.state]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel required>Postal code</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="400001"
                  autoComplete="postal-code"
                  {...register("postalCode")}
                />
                <FieldError errors={[errors.postalCode]} />
              </FieldContent>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel>Order notes (optional)</FieldLabel>
              <FieldContent>
                <Textarea
                  rows={3}
                  placeholder="Delivery instructions, gift note, etc."
                  {...register("notes")}
                />
                <FieldError errors={[errors.notes]} />
              </FieldContent>
            </Field>
          </div>
        </section>

        {/* Payment method */}
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-5 font-heading text-lg font-bold">Payment method</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.filter(
              (method) => method !== "Razorpay" || Boolean(razorpay?.configured),
            ).map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-[:checked]:border-[oklch(0.62_0.13_70)] has-[:checked]:bg-[oklch(0.72_0.15_75/0.08)]"
              >
                <input
                  type="radio"
                  value={method}
                  className="size-4 accent-[oklch(0.62_0.13_70)]"
                  {...register("paymentMethod")}
                />
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {method === "PayPal" ? (
                    <Wallet className="size-4" aria-hidden="true" />
                  ) : method === "Razorpay" ? (
                    <IndianRupee className="size-4" aria-hidden="true" />
                  ) : (
                    <Banknote className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="text-sm font-medium">{method}</span>
              </label>
            ))}
          </div>
          <FieldError errors={[errors.paymentMethod]} />
        </section>
      </div>

      {/* ── Order summary column ── */}
      <aside className="h-fit rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-heading text-lg font-bold">Order summary</h2>

        <div className="mb-5">
          <CouponCards appliedCode={appliedPromo} onApply={applyPromo} compact />
        </div>

        <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <CartItemThumb name={item.name} image={item.image} className="size-12 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatMoneyExact(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mb-4" />

        <dl className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoneyExact(totals.subtotal)}
            </dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount{appliedPromo ? ` (${appliedPromo})` : ""}
              </dt>
              <dd className="font-medium text-emerald-600 tabular-nums dark:text-emerald-500">
                −{formatMoneyExact(totals.discount)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
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

        <Separator className="mb-4" />

        <div className="mb-5 flex items-center justify-between">
          <span className="font-heading text-base font-bold">Total</span>
          <span className="font-heading text-2xl font-bold tabular-nums">
            {formatMoneyExact(totals.total)}
          </span>
        </div>

        {serverError && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl"
          disabled={isSubmitting}
        >
          <Lock className="mr-2 size-4" aria-hidden="true" />
          {isSubmitting
            ? "Processing…"
            : paymentMethod === "Razorpay"
              ? "Pay with Razorpay"
              : "Place order"}
        </Button>

        <Button asChild variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground">
          <Link href="/cart">
            <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
            Back to cart
          </Link>
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Secure checkout. Details are validated on our secure server.
        </p>
      </aside>
    </form>
  );
}
