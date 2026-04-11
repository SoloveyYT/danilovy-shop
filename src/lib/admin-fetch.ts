/**
 * Запросы к API админки без HTTP-кэша браузера.
 * Иначе после сохранения товара GET /api/admin/... может вернуть старый JSON без новых фото.
 */
export function fetchAdmin(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, cache: "no-store" });
}
