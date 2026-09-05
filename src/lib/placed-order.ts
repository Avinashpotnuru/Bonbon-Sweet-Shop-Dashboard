/**
 * Shape of a successfully placed order, shared between the server action
 * (produces it), checkout form (persists it), and the order-success page
 * (renders it). Stored in sessionStorage so the success page can render a
 * reassuring receipt after the cart has been cleared.
 */

export const ORDER_STORAGE_KEY = "bonbon-placed-order";

export type PlacedOrderItem = {
  productId: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
};

export type PlacedOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: string;
  coupon: string | null;
  placedAt: string;
  items: PlacedOrderItem[];
  amounts: {
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
  };
};
