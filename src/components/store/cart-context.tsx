"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  computeTotals,
  normalizeCoupon,
  FREE_SHIPPING_THRESHOLD,
  DELIVERY_CHARGE,
  type CartTotals,
} from "@/lib/cart-pricing";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  quantity: number;
};

export type CartState = {
  items: CartLine[];
  promoCode: string | null;
};

export { FREE_SHIPPING_THRESHOLD, DELIVERY_CHARGE };

type Action =
  | { type: "ADD"; line: CartLine }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "APPLY_PROMO"; code: string | null }
  | { type: "HYDRATE"; cart: CartState };

const STORAGE_KEY = "bonbon-cart-v1";

// Server + first client render both start empty, so hydration can never
// mismatch. The persisted cart is restored right after mount via HYDRATE.
const EMPTY_CART: CartState = { items: [], promoCode: null };

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (i) => i.productId === action.line.productId,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.line.productId
              ? { ...i, quantity: i.quantity + action.line.quantity }
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, action.line] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "SET_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.productId === action.productId
              ? { ...i, quantity: Math.max(1, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [], promoCode: null };
    case "APPLY_PROMO":
      return { ...state, promoCode: action.code };
    case "HYDRATE":
      return action.cart;
    default:
      return state;
  }
}

function loadCart(): CartState {
  if (typeof window === "undefined") return { items: [], promoCode: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], promoCode: null };
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) return { items: [], promoCode: null };
    return { items: parsed.items, promoCode: parsed.promoCode ?? null };
  } catch {
    return { items: [], promoCode: null };
  }
}

type CartContextValue = {
  items: CartLine[];
  count: number;
  totals: CartTotals;
  appliedPromo: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const [open, setOpen] = useState(false);
  const isFirstRender = useRef(true);

  // Restore the persisted cart once — after mount, outside hydration — so the
  // server-rendered HTML and the first client render always agree.
  useEffect(() => {
    const stored = loadCart();
    if (stored.items.length || stored.promoCode) {
      queueMicrotask(() => dispatch({ type: "HYDRATE", cart: stored }));
    }
  }, []);

  useEffect(() => {
    // Never clobber stored cart with the initial empty snapshot before the
    // HYDRATE dispatch above has had a chance to restore it.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — ignore
    }
  }, [state]);

  const addItem = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      dispatch({ type: "ADD", line: { ...line, quantity } });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE", productId });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "SET_QTY", productId, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const applyPromo = useCallback(
    (code: string): { ok: boolean; message: string } => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, message: "Enter a promo code." };
      if (normalizeCoupon(normalized) !== normalized) {
        return { ok: false, message: "That promo code isn't valid." };
      }
      dispatch({ type: "APPLY_PROMO", code: normalized });
      return { ok: true, message: "Promo applied — nice savings!" };
    },
    [],
  );

  const removePromo = useCallback(() => {
    dispatch({ type: "APPLY_PROMO", code: null });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totals = computeTotals(state.items, state.promoCode);

    return {
      items: state.items,
      count: totals.count,
      totals,
      appliedPromo: state.promoCode,
      open,
      setOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      applyPromo,
      removePromo,
    };
  }, [
    state,
    open,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    applyPromo,
    removePromo,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
