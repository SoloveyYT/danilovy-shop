export type ProductSortMode = "default" | "price-asc" | "price-desc" | "new-first" | "old-first";

/** Числовая цена для сортировки и фильтров (строка из Prisma JSON, число и т.д.). */
export function rubFromUnknown(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function sortProductList<T extends { createdAt: string | Date }>(
  items: T[],
  mode: ProductSortMode,
  getPrice: (item: T) => unknown,
): T[] {
  if (mode === "default") return items;

  const copy = [...items];
  const time = (x: T) => new Date(x.createdAt).getTime();

  switch (mode) {
    case "price-asc":
      copy.sort((a, b) => rubFromUnknown(getPrice(a)) - rubFromUnknown(getPrice(b)));
      break;
    case "price-desc":
      copy.sort((a, b) => rubFromUnknown(getPrice(b)) - rubFromUnknown(getPrice(a)));
      break;
    case "new-first":
      copy.sort((a, b) => time(b) - time(a));
      break;
    case "old-first":
      copy.sort((a, b) => time(a) - time(b));
      break;
    default:
      break;
  }
  return copy;
}
