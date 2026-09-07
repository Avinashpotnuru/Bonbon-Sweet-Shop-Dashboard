/**
 * Shared checkout pricing rules used by BOTH the client cart (for live
 * feedback) and the server action (for the authoritative order totals).
 *
 * Keeping this in a dependency-light module (no "server-only") lets the server
 * recompute the total from scratch so the client can never underpay by editing
 * its own totals. Coupons are resolved server-side (DB-backed); the client
 * only ever carries the resolved `{ label, percent }` for the preview.
 */

export type CartPricingLine = {
  price: number;
  quantity: number;
};

export type CouponPricing = {
  label: string;
  percent: number;
};

export const FREE_SHIPPING_THRESHOLD = 60;
export const DELIVERY_CHARGE = 5.99;

export type CartTotals = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  count: number;
};

export function computeTotals(
  lines: CartPricingLine[],
  coupon: CouponPricing | null | undefined,
): CartTotals {
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const percent = coupon?.percent ?? 0;
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