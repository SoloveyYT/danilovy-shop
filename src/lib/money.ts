import { Decimal } from "@prisma/client/runtime/library";

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
