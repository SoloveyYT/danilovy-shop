/** Справочник категорий для услуг (ремонт / изготовление и т.д.) */
export const DEFAULT_SERVICE_CATEGORIES = ["Услуги", "Ремонт", "Изготовление", "Прочее"] as const;

export function buildServiceCategoryFilterOptions(items: { category: string }[]): string[] {
  const base: string[] = [...DEFAULT_SERVICE_CATEGORIES];
  const extra = new Set<string>();
  for (const i of items) {
    const c = (i.category || "").trim();
    if (c && !base.includes(c)) extra.add(c);
  }
  return ["Все", ...base, ...Array.from(extra).sort()];
}
