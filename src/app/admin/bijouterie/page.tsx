"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";
import { formatRub } from "@/lib/money";
import { CategorySelect } from "@/components/CategorySelect";

type Row = {
  id: string;
  article: string;
  title: string;
  category: string;
  description: string;
  price: unknown;
  stock: number;
  imageUrl: string | null;
  imageUrlsJson: string;
};

export default function AdminBijouteriePage() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetchAdmin("/api/admin/bijouterie")
      .then((r) => r.json())
      .then((d) => setList(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    article: "",
    title: "",
    category: "",
    description: "",
    price: "",
    stock: "0",
    imageUrls: [] as string[],
  });

  function reset() {
    setEditingId(null);
    setForm({ article: "", title: "", category: "", description: "", price: "", stock: "0", imageUrls: [] });
  }

  function startEdit(it: Row) {
    setEditingId(it.id);
    let urls: string[] = [];
    try {
      const a = JSON.parse(it.imageUrlsJson || "[]") as unknown;
      urls = Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
      const c = it.imageUrl?.trim();
      if (c && !urls.includes(c)) urls = [c, ...urls];
      else if (!urls.length && c) urls = [c];
    } catch {
      urls = it.imageUrl ? [it.imageUrl] : [];
    }
    setForm({
      article: it.article,
      title: it.title,
      category: it.category || "",
      description: it.description || "",
      price: String(it.price),
      stock: String(it.stock),
      imageUrls: urls,
    });
  }

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const imageUrlsJson = JSON.stringify(form.imageUrls);
    const imageUrl = form.imageUrls[0] || null;
    const body = {
      article: form.article.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      imageUrl,
      imageUrlsJson,
    };

    if (editingId) {
      const res = await fetchAdmin(`/api/admin/bijouterie/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        reset();
        load();
      } else alert("Ошибка");
      return;
    }

    const res = await fetchAdmin("/api/admin/bijouterie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      reset();
      load();
    } else alert("Ошибка создания");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Каталог бижутерии</h1>

      <form onSubmit={submit} className="card-jewel mt-8 space-y-3 p-6">
        <p className="text-sm font-semibold">{editingId ? "Редактирование" : "Новая позиция"}</p>
        {editingId && (
          <button type="button" className="text-sm text-accent hover:underline" onClick={reset}>
            Отмена
          </button>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Артикул"
            required
            value={form.article}
            onChange={(e) => setForm((p) => ({ ...p, article: e.target.value }))}
            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="mb-1 block text-xs text-muted">Категория</label>
            <CategorySelect value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
          </div>
          <input
            placeholder="Цена"
            required
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Остаток на складе"
            type="number"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
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
        <input type="file" accept="image/*" multiple onChange={uploadFiles} className="text-sm" />
        <div className="flex flex-wrap gap-2">
          {form.imageUrls.map((url, i) => (
            <div key={url + i}>
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
          {editingId ? "Сохранить" : "Добавить"}
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
                  <span className="text-gold">{s.article}</span> — <strong>{s.title}</strong> —{" "}
                  {formatRub(s.price as number)} · остаток {s.stock}
                </div>
                <div className="flex gap-3">
                  <button type="button" className="text-accent hover:underline" onClick={() => startEdit(s)}>
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="text-red-700 hover:underline"
                    onClick={async () => {
                      if (!confirm("Удалить?")) return;
                      await fetchAdmin(`/api/admin/bijouterie/${s.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
