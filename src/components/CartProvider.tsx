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

function catalogMaterialKey(m: CartLine["selectedMaterial"] | undefined) {
  return m === "GOLD" ? "GOLD" : "SILVER";
}

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

  /** Старые записи в localStorage: не больше maxStock */
  useEffect(() => {
    if (!ready) return;
    setLines((prev) => {
      let changed = false;
      const next = prev.map((l) => {
        if (l.type === "BIJOUTERIE" && l.maxStock != null && l.quantity > l.maxStock) {
          changed = true;
          return { ...l, quantity: l.maxStock };
        }
        return l;
      });
      return changed ? next : prev;
    });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "key"> & { key?: string }) => {
    const key =
      line.key ||
      `${line.type}-${line.serviceId || line.catalogItemId || line.bijouterieItemId || ""}-${line.selectedSize || ""}-${line.selectedStone || ""}-${catalogMaterialKey(line.selectedMaterial)}-${Date.now()}`;
    const capQty = (q: number, max: number | undefined) =>
      Math.max(1, Math.min(max ?? 99, Math.floor(q)));

    setLines((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.type === line.type &&
          p.serviceId === line.serviceId &&
          p.catalogItemId === line.catalogItemId &&
          p.bijouterieItemId === line.bijouterieItemId &&
          p.selectedSize === line.selectedSize &&
          p.selectedStone === line.selectedStone &&
          catalogMaterialKey(p.selectedMaterial) === catalogMaterialKey(line.selectedMaterial),
      );
      if (idx >= 0) {
        const next = [...prev];
        const max =
          line.type === "BIJOUTERIE" && line.maxStock != null
            ? line.maxStock
            : next[idx].maxStock;
        const mergedQty = capQty(next[idx].quantity + line.quantity, max);
        next[idx] = {
          ...next[idx],
          quantity: mergedQty,
          maxStock: line.type === "BIJOUTERIE" ? (line.maxStock ?? next[idx].maxStock) : next[idx].maxStock,
        };
        return next;
      }
      const initialQty = capQty(line.quantity, line.type === "BIJOUTERIE" ? line.maxStock : undefined);
      return [...prev, { ...line, key, quantity: initialQty } as CartLine];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const max = l.type === "BIJOUTERIE" && l.maxStock != null ? l.maxStock : 99;
        const q = Math.max(1, Math.min(max, Math.floor(qty)));
        return { ...l, quantity: q };
      }),
    );
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
