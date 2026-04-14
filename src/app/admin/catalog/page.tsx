"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";
import { formatRub } from "@/lib/money";
import { CategorySelect } from "@/components/CategorySelect";

type SizeRow = { label: string; modifier: string };
type StoneRow = { name: string; modifier: string };

type Item = {
  id: string;
  article: string;
  title: string;
  category: string;
  description: string;
  basePrice: unknown;
  sizesJson: string;
  stonesJson: string;
  imageUrl: string | null;
  imageUrlsJson: string;
};

function parseSizes(raw: string): SizeRow[] {
  try {
    const j = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(j)) return [];
    return j
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        return {
          label: String(o.label ?? ""),
          modifier: String(o.modifier ?? "0"),
        };
      })
      .filter((x) => x && x.label) as SizeRow[];
  } catch {
    return [];
  }
}

function parseStones(raw: string): StoneRow[] {
  try {
    const j = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(j)) return [];
    return j
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        return {
          name: String(o.name ?? ""),
          modifier: String(o.modifier ?? "0"),
        };
      })
      .filter((x) => x && x.name) as StoneRow[];
  } catch {
    return [];
  }
}

export default function AdminCatalogPage() {
  const [list, setList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    fetchAdmin("/api/admin/catalog")
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
    basePrice: "",
    sizes: [] as SizeRow[],
    stones: [] as StoneRow[],
    imageUrls: [] as string[],
  });

  function resetForm() {
    setEditingId(null);
    setForm({
      article: "",
      title: "",
      category: "",
      description: "",
      basePrice: "",
      sizes: [],
      stones: [],
      imageUrls: [],
    });
  }

  function startEdit(it: Item) {
    setEditingId(it.id);
    setForm({
      article: it.article,
      title: it.title,
      category: it.category || "",
      description: it.description || "",
      basePrice: String(it.basePrice),
      sizes: parseSizes(it.sizesJson),
      stones: parseStones(it.stonesJson),
      imageUrls: (() => {
        try {
          const a = JSON.parse(it.imageUrlsJson || "[]") as unknown;
          const urls = Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
          const cover = it.imageUrl?.trim();
          if (cover && !urls.includes(cover)) return [cover, ...urls];
          return urls.length ? urls : cover ? [cover] : [];
        } catch {
          return it.imageUrl ? [it.imageUrl] : [];
        }
      })(),
    });
  }

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const next = [...form.imageUrls];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetchAdmin("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) next.push(data.url as string);
      else alert(data.error || "Ошибка загрузки");
    }
    setForm((p) => ({ ...p, imageUrls: next }));
    e.target.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sizesJson = JSON.stringify(
      form.sizes.map((s) => ({ label: s.label.trim(), modifier: s.modifier.trim() || "0" })),
    );
    const stonesJson = JSON.stringify(
      form.stones.map((s) => ({ name: s.name.trim(), modifier: s.modifier.trim() || "0" })),
    );
    const imageUrlsJson = JSON.stringify(form.imageUrls);
    const imageUrl = form.imageUrls[0] || null;

    const body = {
      article: form.article.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      sizesJson,
      stonesJson,
      imageUrl,
      imageUrlsJson,
    };

    if (editingId) {
      const res = await fetchAdmin(`/api/admin/catalog/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetForm();
        load();
      } else alert("Ошибка сохранения");
      return;
    }

    const res = await fetchAdmin("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      load();
    } else alert("Ошибка создания");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Каталог</h1>
      <p className="mt-2 text-sm text-muted">
        Размеры и камни: добавляйте строки кнопкой «+». Фото: можно выбрать несколько файлов сразу.
      </p>

      <form onSubmit={submit} className="card-jewel mt-8 space-y-4 p-6">
        <p className="text-sm font-semibold text-ink">{editingId ? "Редактирование" : "Новая позиция"}</p>
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
          <div>
            <label className="mb-1 block text-xs text-muted">Категория</label>
            <CategorySelect value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
          </div>
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

        <div className="rounded-sm border border-stone-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-ink">Размеры (надбавка к базе, ₽)</p>
          {form.sizes.map((row, i) => (
            <div key={i} className="mt-2 flex flex-wrap gap-2">
              <input
                placeholder="Подпись (17, 18 см…)"
                value={row.label}
                onChange={(e) => {
                  const next = [...form.sizes];
                  next[i] = { ...next[i], label: e.target.value };
                  setForm((p) => ({ ...p, sizes: next }));
                }}
                className="min-w-[120px] flex-1 rounded-sm border border-stone-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="0"
                type="number"
                value={row.modifier}
                onChange={(e) => {
                  const next = [...form.sizes];
                  next[i] = { ...next[i], modifier: e.target.value };
                  setForm((p) => ({ ...p, sizes: next }));
                }}
                className="w-24 rounded-sm border border-stone-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                className="text-sm text-red-700"
                onClick={() => setForm((p) => ({ ...p, sizes: p.sizes.filter((_, j) => j !== i) }))}
              >
                Удалить
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 text-sm text-accent hover:underline"
            onClick={() => setForm((p) => ({ ...p, sizes: [...p.sizes, { label: "", modifier: "0" }] }))}
          >
            + Размер
          </button>
        </div>

        <div className="rounded-sm border border-stone-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-ink">Камни / вставки (надбавка к базе, ₽)</p>
          {form.stones.map((row, i) => (
            <div key={i} className="mt-2 flex flex-wrap gap-2">
              <input
                placeholder="Название"
                value={row.name}
                onChange={(e) => {
                  const next = [...form.stones];
                  next[i] = { ...next[i], name: e.target.value };
                  setForm((p) => ({ ...p, stones: next }));
                }}
                className="min-w-[120px] flex-1 rounded-sm border border-stone-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="0"
                type="number"
                value={row.modifier}
                onChange={(e) => {
                  const next = [...form.stones];
                  next[i] = { ...next[i], modifier: e.target.value };
                  setForm((p) => ({ ...p, stones: next }));
                }}
                className="w-24 rounded-sm border border-stone-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                className="text-sm text-red-700"
                onClick={() => setForm((p) => ({ ...p, stones: p.stones.filter((_, j) => j !== i) }))}
              >
                Удалить
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 text-sm text-accent hover:underline"
            onClick={() => setForm((p) => ({ ...p, stones: [...p.stones, { name: "", modifier: "0" }] }))}
          >
            + Камень
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Фотографии (первое — обложка)</p>
          <input type="file" accept="image/*" multiple onChange={uploadFiles} className="mt-1 text-sm" />
          <ul className="mt-2 flex flex-wrap gap-2">
            {form.imageUrls.map((url, i) => (
              <li key={`${url}-${i}`} className="relative">
                <img src={url} alt="" className="h-16 w-16 rounded border object-cover" />
                <button
                  type="button"
                  className="mt-1 block text-xs text-red-700"
                  onClick={() =>
                    setForm((p) => ({ ...p, imageUrls: p.imageUrls.filter((_, j) => j !== i) }))
                  }
                >
                  Убрать
                </button>
              </li>
            ))}
          </ul>
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
                  <span className="text-gold">{s.article}</span> — <strong>{s.title}</strong>
                  {(s.category || "").trim() ? (
                    <span className="text-muted"> · {s.category}</span>
                  ) : null}{" "}
                  — от {formatRub(s.basePrice as number)}
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
                      await fetchAdmin(`/api/admin/catalog/${s.id}`, { method: "DELETE" });
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
