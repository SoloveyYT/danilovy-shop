/**
 * Дефолтный справочник категорий (если в настройках мастерской пусто).
 * Редактируемый список хранится в Setting `jewelry_categories_json`.
 */
export const DEFAULT_JEWELRY_CATEGORIES = [
  "Кольца",
  "Серьги",
  "Браслеты",
  "Подвески",
  "Цепи",
  "Колье",
  "Броши",
  "Часы",
  "Прочее",
] as const;

export function parseJewelryCategoriesJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [...DEFAULT_JEWELRY_CATEGORIES];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      const cleaned = parsed.map((s) => String(s).trim()).filter(Boolean);
      if (cleaned.length > 0) return cleaned;
    }
  } catch {
    /* use default */
  }
  return [...DEFAULT_JEWELRY_CATEGORIES];
}

/** Кнопки фильтра: «Все», затем категории из настроек, затем любые лишние из товаров (старые данные). */
export function buildCategoryFilterOptions(
  items: { category: string }[],
  baseCategories: string[],
): string[] {
  const base = [...baseCategories];
  const extra = new Set<string>();
  for (const i of items) {
    const c = (i.category || "").trim();
    if (c && !base.includes(c)) extra.add(c);
  }
  return ["Все", ...base, ...Array.from(extra).sort()];
}
