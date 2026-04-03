"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRub } from "@/lib/money";

type Item = {
  id: string;
  article: string;
  title: string;
  basePrice: unknown;
  sizesJson: string;
  stonesJson: string;
  imageUrl: string | null;
};

export default function AdminCatalogPage() {
  const [list, setList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetch("/api/admin/catalog")
      .then((r) => r.json())
      .then((d) => setList(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [form, setForm] = useState({
    article: "",
    title: "",
    description: "",
    basePrice: "",
    sizesJson: "[]",
    stonesJson: "[]",
    imageUrl: "",
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article: form.article,
        title: form.title,
        description: form.description,
        basePrice: Number(form.basePrice),
        sizesJson: form.sizesJson,
        stonesJson: form.stonesJson,
        imageUrl: form.imageUrl || null,
      }),
    });
    if (res.ok) {
      setForm({
        article: "",
        title: "",
        description: "",
        basePrice: "",
        sizesJson: "[]",
        stonesJson: "[]",
        imageUrl: "",
      });
      load();
    } else alert("Ошибка создания");
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((prev) => ({ ...prev, imageUrl: data.url }));
    else alert(data.error || "Ошибка загрузки");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Каталог серебра</h1>
      <p className="mt-2 text-sm text-muted">
        JSON размеров:{" "}
        <code className="text-xs">[{`{"label":"17","modifier":"0"}`}]</code> · камней:{" "}
        <code className="text-xs">[{`{"name":"Фианит","modifier":"800"}`}]</code>
      </p>

      <form onSubmit={create} className="card-jewel mt-8 space-y-3 p-6">
        <p className="text-sm font-semibold text-ink">Новая позиция</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Артикул"
            required
            value={form.article}
            onChange={(e) => setForm((p) => ({ ...p, article: e.target.value }))}
            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Базовая цена"
            required
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          placeholder="Название"
          required
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          rows={2}
        />
        <textarea
          placeholder='sizesJson, например [{"label":"17","modifier":"0"}]'
          value={form.sizesJson}
          onChange={(e) => setForm((p) => ({ ...p, sizesJson: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 font-mono text-xs"
          rows={2}
        />
        <textarea
          placeholder='stonesJson, например [{"name":"Фианит","modifier":"800"}]'
          value={form.stonesJson}
          onChange={(e) => setForm((p) => ({ ...p, stonesJson: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 font-mono text-xs"
          rows={2}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" accept="image/*" onChange={uploadFile} className="text-sm" />
          <input
            placeholder="URL изображения"
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            className="min-w-[200px] flex-1 rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-cream">
          Добавить
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {list.map((s) => (
            <li key={s.id} className="card-jewel p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <span className="text-gold">{s.article}</span> — <strong>{s.title}</strong> — от{" "}
                  {formatRub(s.basePrice as number)}
                </div>
                <button
                  type="button"
                  className="text-red-700 hover:underline"
                  onClick={async () => {
                    if (!confirm("Удалить?")) return;
                    await fetch(`/api/admin/catalog/${s.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
