import { Decimal } from "@prisma/client/runtime/library";
import type { CartLine } from "./cart-types";

export function toNumber(d: Decimal | number | string): number {
  if (typeof d === "number") return d;
  return Number(d);
}

export function formatRub(amount: number | Decimal | string): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Сумма по строке корзины (каталог, золото — без фикс. цены на витрине). */
export function cartLineChargesRub(l: CartLine): number {
  if (l.type === "CATALOG" && l.selectedMaterial === "GOLD") return 0;
  return l.unitPrice * l.quantity;
}

export function cartSubtotalRub(lines: CartLine[]): number {
  return lines.reduce((a, l) => a + cartLineChargesRub(l), 0);
}

export function cartHasGoldCatalog(lines: CartLine[]): boolean {
  return lines.some((l) => l.type === "CATALOG" && l.selectedMaterial === "GOLD");
}
