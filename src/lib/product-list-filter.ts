/** Поиск по названию или артикулу (без учёта регистра). */
export function matchesProductSearch(title: string, article: string, query: string): boolean {
  const s = query.trim().toLowerCase();
  if (!s) return true;
  const t = (title ?? "").trim().toLowerCase();
  const a = (article ?? "").trim().toLowerCase();
  return t.includes(s) || a.includes(s);
}

function parseRubBound(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** Фильтр по полной цене в ₽; пустые поля «от/до» — без ограничения с этой стороны. */
export function matchesPriceRange(priceRub: number, minStr: string, maxStr: string): boolean {
  const min = parseRubBound(minStr);
  const max = parseRubBound(maxStr);
  if (min !== null && priceRub < min) return false;
  if (max !== null && priceRub > max) return false;
  return true;
}
