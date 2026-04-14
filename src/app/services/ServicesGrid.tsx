"use client";

import { useMemo, useState } from "react";
import { formatRub } from "@/lib/money";
import { AddServiceButton } from "@/components/AddServiceButton";
import { SafeImage } from "@/components/SafeImage";
import { buildServiceCategoryFilterOptions } from "@/lib/service-categories";

type Item = {
  id: string;
  article: string;
  title: string;
  category: string;
  description: string;
  price: unknown;
  imageUrl: string | null;
};

export function ServicesGrid({ items }: { items: Item[] }) {
  const categories = useMemo(() => buildServiceCategoryFilterOptions(items), [items]);
  const [cat, setCat] = useState("Все");

  const filtered = useMemo(() => {
    if (cat === "Все") return items;
    return items.filter((s) => (s.category || "").trim() === cat);
  }, [items, cat]);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              cat === c
                ? "border-accent bg-accent/10 text-ink"
                : "border-stone-300 text-muted hover:border-stone-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {filtered.map((s) => (
          <li key={s.id} className="card-jewel flex flex-col overflow-hidden md:flex-row">
            <div className="relative h-48 w-full bg-stone-100 md:h-auto md:w-44 md:shrink-0">
              {s.imageUrl ? (
                <SafeImage
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 200px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">Нет фото</div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              {(s.category || "").trim() ? (
                <p className="text-xs uppercase tracking-wider text-accent">{s.category}</p>
              ) : null}
              <p className="text-xs uppercase tracking-wider text-gold">арт. {s.article}</p>
              <h2 className="font-display mt-1 text-xl font-semibold text-ink">{s.title}</h2>
              {s.description ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <p className="text-lg font-semibold text-ink">{formatRub(s.price as number)}</p>
                <AddServiceButton
                  serviceId={s.id}
                  title={s.title}
                  price={Number(s.price)}
                  imageUrl={s.imageUrl}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
