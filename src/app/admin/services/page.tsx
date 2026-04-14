"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";
import { formatRub } from "@/lib/money";
import { ServiceCategorySelect } from "@/components/ServiceCategorySelect";

type Service = {
  id: string;
  article: string;
  title: string;
  category: string;
  description: string;
  price: unknown;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminServicesPage() {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetchAdmin("/api/admin/services")
      .then((r) => r.json())
      .then((d) => setList(d.services || []))
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
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
  });

  function resetForm() {
    setEditingId(null);
    setForm({
      article: "",
      title: "",
      category: "",
      description: "",
      price: "",
      imageUrl: "",
      sortOrder: "0",
      isActive: true,
    });
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      article: s.article,
      title: s.title,
      category: s.category || "",
      description: s.description || "",
      price: String(s.price),
      imageUrl: s.imageUrl || "",
      sortOrder: String(s.sortOrder),
      isActive: s.isActive,
    });
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetchAdmin("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((prev) => ({ ...prev, imageUrl: data.url }));
    else alert(data.error || "Ошибка загрузки");
    e.target.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      article: form.article.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    if (editingId) {
      const res = await fetchAdmin(`/api/admin/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetForm();
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(typeof data.error === "string" ? data.error : "Ошибка сохранения");
      }
      return;
    }

    const res = await fetchAdmin("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(typeof data.error === "string" ? data.error : "Ошибка создания (артикул занят?)");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Услуги</h1>

      <form onSubmit={submit} className="card-jewel mt-8 space-y-3 p-6">
        <p className="text-sm font-semibold text-ink">{editingId ? "Редактирование" : "Новая услуга"}</p>
        {editingId && (
          <button type="button" className="text-sm text-accent hover:underline" onClick={resetForm}>
            Отменить редактирование
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
          <input
            placeholder="Цена (руб.)"
            required
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Категория</label>
          <ServiceCategorySelect value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
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
        <input
          placeholder="Порядок сортировки"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
          Показывать на сайте
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" accept="image/*" onChange={uploadFile} className="text-sm" />
          <input
            placeholder="URL изображения (или загрузите файл)"
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            className="min-w-[200px] flex-1 rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
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
                  <span className="text-gold">{s.article}</span>
                  {(s.category || "").trim() ? (
                    <span className="text-muted"> · {s.category}</span>
                  ) : null}{" "}
                  — <strong>{s.title}</strong> — {formatRub(s.price as number)}
                  {!s.isActive ? <span className="ml-2 text-xs text-muted">(скрыта)</span> : null}
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
                      await fetchAdmin(`/api/admin/services/${s.id}`, { method: "DELETE" });
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
