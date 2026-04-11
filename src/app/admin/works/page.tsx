"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";
import { CategorySelect } from "@/components/CategorySelect";

type Work = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  imageUrlsJson: string;
  sortOrder: number;
  isPublished: boolean;
};

export default function AdminWorksPage() {
  const [list, setList] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetchAdmin("/api/admin/works")
      .then((r) => r.json())
      .then((d) => setList(d.works || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    imageUrls: [] as string[],
    sortOrder: "0",
    isPublished: true,
  });

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const next = [...form.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await fetchAdmin("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) next.push(data.url as string);
      else alert(data.error || "Ошибка");
    }
    setForm((p) => ({ ...p, imageUrls: next }));
    e.target.value = "";
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const imageUrlsJson = JSON.stringify(form.imageUrls);
    const imageUrl = form.imageUrls[0] || null;
    const res = await fetchAdmin("/api/admin/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        imageUrl,
        imageUrlsJson,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      }),
    });
    if (res.ok) {
      setForm({
        title: "",
        description: "",
        category: "",
        imageUrls: [],
        sortOrder: "0",
        isPublished: true,
      });
      load();
    } else alert("Ошибка");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Примеры работ</h1>

      <form onSubmit={create} className="card-jewel mt-8 space-y-3 p-6">
        <input
          placeholder="Заголовок"
          required
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
        <div>
          <label className="mb-1 block text-xs text-muted">Категория (необязательно)</label>
          <CategorySelect value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
        </div>
        <textarea
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          rows={2}
        />
        <input
          type="number"
          placeholder="Порядок сортировки"
          value={form.sortOrder}
          onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
          />
          Показывать на сайте
        </label>
        <input type="file" accept="image/*" multiple onChange={uploadFiles} className="text-sm" />
        <div className="flex flex-wrap gap-2">
          {form.imageUrls.map((url, i) => (
            <div key={url + i} className="text-center">
              <img src={url} alt="" className="h-16 w-16 rounded border object-cover" />
              <button
                type="button"
                className="text-xs text-red-700"
                onClick={() => setForm((p) => ({ ...p, imageUrls: p.imageUrls.filter((_, j) => j !== i) }))}
              >
                Убрать
              </button>
            </div>
          ))}
        </div>
        <button type="submit" className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-cream">
          Добавить
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {list.map((w) => (
            <li key={w.id} className="card-jewel flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
              <span>
                <strong>{w.title}</strong>
                {w.category ? ` · ${w.category}` : ""} · {w.isPublished ? "на сайте" : "скрыто"}
              </span>
              <button
                type="button"
                className="text-red-700 hover:underline"
                onClick={async () => {
                  if (!confirm("Удалить?")) return;
                  await fetchAdmin(`/api/admin/works/${w.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
