"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "bonbon-wishlist-v1";

export type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  ids: Set<string>;
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => readStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item],
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistContextValue>(() => {
    const ids = new Set(items.map((i) => i.productId));
    return {
      items,
      ids,
      count: items.length,
      isInWishlist,
      toggleItem,
      removeItem,
      clear,
    };
  }, [items, isInWishlist, toggleItem, removeItem, clear]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
