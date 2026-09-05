/**
 * Shared checkout pricing rules used by BOTH the client cart (for live
 * feedback) and the server action (for the authoritative order totals).
 *
 * Keeping this in a dependency-light module (no "server-only") lets the server
 * recompute the total from scratch so the client can never underpay by editing
 * its own totals.
 */

export type CartPricingLine = {
  price: number;
  quantity: number;
};

export const FREE_SHIPPING_THRESHOLD = 60;
export const DELIVERY_CHARGE = 5.99;

/** Known coupon codes as percentage discounts off the pre-delivery subtotal. */
export const COUPONS: Record<string, { label: string; percent: number }> = {
  SWEET10: { label: "SWEET10", percent: 0.1 },
  BONBON15: { label: "BONBON15", percent: 0.15 },
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  count: number;
};

export function normalizeCoupon(code: string | null | undefined): string | null {
  const normalized = (code ?? "").trim().toUpperCase();
  return normalized in COUPONS ? normalized : null;
}

export function computeTotals(
  lines: CartPricingLine[],
  coupon: string | null | undefined,
): CartTotals {
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const normalized = normalizeCoupon(coupon);
  const percent = normalized ? COUPONS[normalized].percent : 0;
  const discount = subtotal * percent;
  const discountedSubtotal = subtotal - discount;

  const delivery =
    count === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_CHARGE;

  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    delivery: roundMoney(delivery),
    total: roundMoney(discountedSubtotal + delivery),
    count,
  };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
