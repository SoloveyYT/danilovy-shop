"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/cart-types";

const STORAGE_KEY = "danilovy_cart_v1";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "key"> & { key?: string }) => void;
  removeLine: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as CartLine[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(loadLines());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "key"> & { key?: string }) => {
    const key =
      line.key ||
      `${line.type}-${line.serviceId || line.catalogItemId || line.bijouterieItemId || ""}-${line.selectedSize || ""}-${line.selectedStone || ""}-${Date.now()}`;
    setLines((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.type === line.type &&
          p.serviceId === line.serviceId &&
          p.catalogItemId === line.catalogItemId &&
          p.bijouterieItemId === line.bijouterieItemId &&
          p.selectedSize === line.selectedSize &&
          p.selectedStone === line.selectedStone,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity };
        return next;
      }
      return [...prev, { ...line, key } as CartLine];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(qty)));
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: q } : l)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((a, l) => a + l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, addLine, removeLine, updateQty, clear, count }),
    [lines, addLine, removeLine, updateQty, clear, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
