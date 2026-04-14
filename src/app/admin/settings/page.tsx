"use client";

import { useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";
import { parseJewelryCategoriesJson } from "@/lib/product-categories";

export default function AdminSettingsPage() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmin("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const m = d.settings || {};
        setMap(m);
        setCategories(parseJewelryCategoriesJson(m.jewelry_categories_json));
      })
      .finally(() => setLoading(false));
  }, []);

  function moveCategory(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[i], next[j]] = [next[j], next[i]];
    setCategories(next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = categories.map((c) => c.trim()).filter(Boolean);
    const res = await fetchAdmin("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_address: map.shop_address,
        shop_phone: map.shop_phone,
        shop_schedule_json: map.shop_schedule_json,
        courier_fee_rub: map.courier_fee_rub,
        yandex_map_embed_url: map.yandex_map_embed_url,
        jewelry_categories_json: JSON.stringify(cleaned.length ? cleaned : []),
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setMap(d.settings || {});
      setCategories(parseJewelryCategoriesJson(d.settings?.jewelry_categories_json));
      alert("Сохранено");
    } else alert("Ошибка");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Настройки мастерской</h1>
      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : (
        <form onSubmit={save} className="card-jewel mt-8 max-w-2xl space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium">Адрес</label>
            <input
              value={map.shop_address || ""}
              onChange={(e) => setMap((m) => ({ ...m, shop_address: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Телефон</label>
            <input
              value={map.shop_phone || ""}
              onChange={(e) => setMap((m) => ({ ...m, shop_phone: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">График (JSON-массив строк)</label>
            <textarea
              value={map.shop_schedule_json || ""}
              onChange={(e) => setMap((m) => ({ ...m, shop_schedule_json: e.target.value }))}
              rows={5}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Курьер по Москве (руб.)</label>
            <input
              value={map.courier_fee_rub || ""}
              onChange={(e) => setMap((m) => ({ ...m, courier_fee_rub: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">URL встраивания Яндекс.Карт (iframe src)</label>
            <textarea
              value={map.yandex_map_embed_url || ""}
              onChange={(e) => setMap((m) => ({ ...m, yandex_map_embed_url: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 font-mono text-xs"
            />
          </div>

          <div className="border-t border-stone-200 pt-6">
            <h2 className="text-sm font-semibold text-ink">Категории изделий</h2>
            <p className="mt-1 text-xs text-muted">
              Список для каталога, бижутерии и примеров работ. Порядок строк совпадает с порядком в
              выпадающих списках.
            </p>
            <ul className="mt-4 space-y-2">
              {categories.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    value={c}
                    onChange={(e) => {
                      const next = [...categories];
                      next[i] = e.target.value;
                      setCategories(next);
                    }}
                    placeholder="Название категории"
                    className="min-w-0 flex-1 rounded-sm border border-stone-300 px-3 py-2 text-sm"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Выше"
                      disabled={i === 0}
                      onClick={() => moveCategory(i, -1)}
                      className="rounded-sm border border-stone-300 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Ниже"
                      disabled={i === categories.length - 1}
                      onClick={() => moveCategory(i, 1)}
                      className="rounded-sm border border-stone-300 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategories(categories.filter((_, j) => j !== i))}
                      className="rounded-sm border border-stone-300 px-2 py-1 text-xs text-red-800"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setCategories([...categories, ""])}
              className="mt-3 text-sm text-accent hover:underline"
            >
              + Добавить категорию
            </button>
          </div>

          <button type="submit" className="rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
            Сохранить
          </button>
        </form>
      )}
    </div>
  );
}
