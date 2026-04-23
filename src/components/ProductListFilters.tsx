"use client";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  idPrefix: string;
};

export function ProductListFilters({
  search,
  onSearchChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  idPrefix,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-stone-200 bg-white/80 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[min(100%,220px)] flex-1">
        <label htmlFor={`${idPrefix}-search`} className="mb-1 block text-xs text-muted">
          Поиск
        </label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название или артикул"
          autoComplete="off"
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="w-full sm:w-28">
        <label htmlFor={`${idPrefix}-min`} className="mb-1 block text-xs text-muted">
          От, ₽
        </label>
        <input
          id={`${idPrefix}-min`}
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={priceMin}
          onChange={(e) => onPriceMinChange(e.target.value)}
          placeholder="—"
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="w-full sm:w-28">
        <label htmlFor={`${idPrefix}-max`} className="mb-1 block text-xs text-muted">
          До, ₽
        </label>
        <input
          id={`${idPrefix}-max`}
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={priceMax}
          onChange={(e) => onPriceMaxChange(e.target.value)}
          placeholder="—"
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
