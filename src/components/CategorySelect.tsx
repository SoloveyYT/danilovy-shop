"use client";

import { useEffect, useState } from "react";
import { DEFAULT_JEWELRY_CATEGORIES } from "@/lib/product-categories";

type Props = {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  className?: string;
  /** Если задано — список из родителя (без запроса к API) */
  categories?: string[];
};

/** Выбор категории из справочника настроек + «Без категории». */
export function CategorySelect({ value, onChange, id, className, categories: categoriesProp }: Props) {
  const [categories, setCategories] = useState<string[]>(() =>
    categoriesProp?.length ? categoriesProp : [...DEFAULT_JEWELRY_CATEGORIES],
  );

  useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      setCategories(categoriesProp);
      return;
    }
    let cancelled = false;
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d: { jewelryCategories?: string[] }) => {
        if (cancelled || !Array.isArray(d.jewelryCategories) || d.jewelryCategories.length === 0) return;
        setCategories(d.jewelryCategories);
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, [categoriesProp]);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? "w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"}
    >
      <option value="">Без категории</option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      {value && !categories.includes(value) ? (
        <option value={value} title="Категория у позиции не совпадает со справочником">
          {value} (вне справочника)
        </option>
      ) : null}
    </select>
  );
}
