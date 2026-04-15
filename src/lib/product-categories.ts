/**
 * Дефолтный справочник категорий (если в настройках мастерской пусто).
 * Редактируемый список хранится в Setting `jewelry_categories_json`.
 */
export const DEFAULT_JEWELRY_CATEGORIES = [
  "Кольца",
  "Обручальные кольца",
  "Серьги",
  "Браслеты",
  "Подвески",
  "Цепи",
  "Колье",
  "Броши",
  "Часы",
  "Прочее",
] as const;

const REQUIRED_JEWELRY_CATEGORIES = ["Обручальные кольца"] as const;

function withRequiredCategories(categories: string[]): string[] {
  const out = [...categories];
  for (const required of REQUIRED_JEWELRY_CATEGORIES) {
    if (!out.some((c) => c.toLowerCase() === required.toLowerCase())) {
      out.push(required);
    }
  }
  return out;
}

export function parseJewelryCategoriesJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return withRequiredCategories([...DEFAULT_JEWELRY_CATEGORIES]);
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      const cleaned = parsed.map((s) => String(s).trim()).filter(Boolean);
      if (cleaned.length > 0) return withRequiredCategories(cleaned);
    }
  } catch {
    /* use default */
  }
  return withRequiredCategories([...DEFAULT_JEWELRY_CATEGORIES]);
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
