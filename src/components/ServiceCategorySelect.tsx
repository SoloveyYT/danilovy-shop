"use client";

import { DEFAULT_SERVICE_CATEGORIES } from "@/lib/service-categories";

type Props = {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  className?: string;
};

const LIST = DEFAULT_SERVICE_CATEGORIES as readonly string[];

/** Категория услуги: «Услуги», «Ремонт», «Изготовление» и т.д. */
export function ServiceCategorySelect({ value, onChange, id, className }: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? "w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"}
    >
      <option value="">Без категории</option>
      {DEFAULT_SERVICE_CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      {value && !LIST.includes(value) ? (
        <option value={value} title="Сохранённое значение не из списка">
          {value} (вне списка)
        </option>
      ) : null}
    </select>
  );
}
