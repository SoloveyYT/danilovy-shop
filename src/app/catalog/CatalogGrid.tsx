"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatRub } from "@/lib/money";
import { getImageList } from "@/lib/image-list";
import { SafeImage } from "@/components/SafeImage";
import { buildCategoryFilterOptions } from "@/lib/product-categories";

type Item = {
  id: string;
  article: string;
  title: string;
  category: string;
  basePrice: unknown;
  imageUrl: string | null;
  imageUrlsJson: string;
};

export function CatalogGrid({ items, categoryOptions }: { items: Item[]; categoryOptions: string[] }) {
  const categories = useMemo(
    () => buildCategoryFilterOptions(items, categoryOptions),
    [items, categoryOptions],
  );

  const [cat, setCat] = useState("Все");

  const filtered = useMemo(() => {
    if (cat === "Все") return items;
    return items.filter((i) => (i.category || "").trim() === cat);
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

      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const imgs = getImageList(item.imageUrlsJson, item.imageUrl);
          const cover = imgs[0];
          return (
            <li key={item.id} className="card-jewel overflow-hidden">
              <Link href={`/catalog/${item.id}`} className="block">
                <div className="relative aspect-[4/3] bg-stone-100">
                  {cover ? (
                    <SafeImage
                      src={cover}
                      alt={item.title}
                      fill
                      className="object-cover transition hover:opacity-95"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">Нет фото</div>
                  )}
                </div>
                <div className="p-5">
                  {(item.category || "").trim() ? (
                    <p className="text-xs uppercase tracking-wider text-accent">{item.category}</p>
                  ) : null}
                  <p className="text-xs uppercase tracking-wider text-gold">арт. {item.article}</p>
                  <h2 className="font-display mt-1 text-lg font-semibold text-ink">{item.title}</h2>
                  <p className="mt-3 text-sm font-medium text-ink">
                    от {formatRub(item.basePrice as number)} — серебро
                  </p>
                  <p className="mt-1 text-xs text-muted">Золото — по договорённости</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
