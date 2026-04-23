"use client";

import type { ProductSortMode } from "@/lib/product-sort";

type Props = {
  value: ProductSortMode;
  onChange: (v: ProductSortMode) => void;
  id?: string;
  className?: string;
};

export function ProductListSort({ value, onChange, id, className }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <label htmlFor={id ?? "product-list-sort"} className="text-sm text-muted">
        Сортировка
      </label>
      <select
        id={id ?? "product-list-sort"}
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSortMode)}
        className="rounded-sm border border-stone-300 bg-cream px-3 py-1.5 text-sm text-ink"
      >
        <option value="default">Как в мастерской</option>
        <option value="price-asc">Цена: сначала дешевле</option>
        <option value="price-desc">Цена: сначала дороже</option>
        <option value="new-first">Сначала новые</option>
        <option value="old-first">Сначала старые</option>
      </select>
    </div>
  );
}
