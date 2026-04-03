"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setMap(d.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_address: map.shop_address,
        shop_phone: map.shop_phone,
        shop_schedule_json: map.shop_schedule_json,
        courier_fee_rub: map.courier_fee_rub,
        yandex_map_embed_url: map.yandex_map_embed_url,
      }),
    });
    if (res.ok) alert("Сохранено");
    else alert("Ошибка");
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
          <button type="submit" className="rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
            Сохранить
          </button>
        </form>
      )}
    </div>
  );
}
