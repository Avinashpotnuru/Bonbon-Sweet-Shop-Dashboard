import type { Metadata } from "next";

import { CheckoutForm } from "@/components/store/checkout-form";
import { requireCustomerSession } from "@/lib/customer-auth";
import { getRazorpayCheckoutConfig } from "@/lib/razorpay";

export const metadata: Metadata = {
  title: "Checkout — Bonbon",
  description: "Complete your Bonbon order.",
};

/**
 * Customer checkout page: collects contact + delivery details, payment method,
 * and places the order via a server action. The heavy lifting (validation,
 * pricing, stock) happens server-side in checkout-actions.
 *
 * Customers must be signed in to order — anonymous and staff visitors are
 * redirected to the storefront sign-in page with a `next` link back here.
 */
export default async function CheckoutPage() {
  await requireCustomerSession("/checkout");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <span className="store-eyebrow">Checkout</span>
        <h1 className="store-h1">Complete your order</h1>
        <p className="text-sm text-muted-foreground">
          Enter your delivery and payment details to place your order.
        </p>
      </div>

      <CheckoutForm razorpay={getRazorpayCheckoutConfig()} />
    </div>
  );
}
