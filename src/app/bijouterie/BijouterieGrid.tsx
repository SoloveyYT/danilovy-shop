"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatRub } from "@/lib/money";
import { getImageList } from "@/lib/image-list";
import { SafeImage } from "@/components/SafeImage";
import { ProductListFilters } from "@/components/ProductListFilters";
import { ProductListSort } from "@/components/ProductListSort";
import { buildCategoryFilterOptions } from "@/lib/product-categories";
import { matchesPriceRange, matchesProductSearch } from "@/lib/product-list-filter";
import { rubFromUnknown, sortProductList, type ProductSortMode } from "@/lib/product-sort";

type Item = {
  id: string;
  article: string;
  title: string;
  category: string;
  price: unknown;
  stock: number;
  createdAt: Date | string;
  imageUrl: string | null;
  imageUrlsJson: string;
};

export function BijouterieGrid({
  items,
  categoryOptions,
}: {
  items: Item[];
  categoryOptions: string[];
}) {
  const categories = useMemo(
    () => buildCategoryFilterOptions(items, categoryOptions),
    [items, categoryOptions],
  );
  const [cat, setCat] = useState("Все");
  const [sort, setSort] = useState<ProductSortMode>("default");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const filtered = useMemo(() => {
    if (cat === "Все") return items;
    return items.filter((i) => (i.category || "").trim() === cat);
  }, [items, cat]);

  const narrowed = useMemo(() => {
    return filtered.filter((i) => {
      if (!matchesProductSearch(i.title, i.article, search)) return false;
      const p = rubFromUnknown(i.price);
      if (!matchesPriceRange(p, priceMin, priceMax)) return false;
      return true;
    });
  }, [filtered, search, priceMin, priceMax]);

  const sorted = useMemo(
    () => sortProductList(narrowed, sort, (i) => i.price),
    [narrowed, sort],
  );

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
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
        <ProductListSort id="bijouterie-sort" value={sort} onChange={setSort} />
      </div>

      <div className="mt-4">
        <ProductListFilters
          idPrefix="bijouterie"
          search={search}
          onSearchChange={setSearch}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={setPriceMin}
          onPriceMaxChange={setPriceMax}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          {items.length === 0
            ? "Позиций пока нет."
            : "Ничего не найдено — измените поиск или диапазон цены."}
        </p>
      ) : null}

      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item) => {
          const imgs = getImageList(item.imageUrlsJson, item.imageUrl);
          const cover = imgs[0];
          return (
            <li key={item.id} className="card-jewel overflow-hidden">
              <Link href={`/bijouterie/${item.id}`} className="block">
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
                  <p className="mt-3 text-sm font-medium text-ink">{formatRub(item.price as number)}</p>
                  <p className="mt-1 text-xs text-muted">Остаток: {item.stock} шт.</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
