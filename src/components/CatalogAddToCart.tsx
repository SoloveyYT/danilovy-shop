"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { formatRub } from "@/lib/money";

type Opt = { label?: string; name?: string; modifier: string };

function parseOpts(raw: string): Opt[] {
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        return {
          label: typeof o.label === "string" ? o.label : undefined,
          name: typeof o.name === "string" ? o.name : undefined,
          modifier: String(o.modifier ?? "0"),
        };
      })
      .filter(Boolean) as Opt[];
  } catch {
    return [];
  }
}

export function CatalogAddToCart(props: {
  catalogItemId: string;
  title: string;
  basePrice: number;
  sizesJson: string;
  stonesJson: string;
  imageUrl: string | null;
}) {
  const { addLine } = useCart();
  const sizes = useMemo(() => parseOpts(props.sizesJson), [props.sizesJson]);
  const stones = useMemo(() => parseOpts(props.stonesJson), [props.stonesJson]);

  const [size, setSize] = useState(sizes[0]?.label ?? "");
  const [stone, setStone] = useState(stones[0]?.name ?? "");
  const [material, setMaterial] = useState<"SILVER" | "GOLD">("SILVER");

  const silverTotal = useMemo(() => {
    let t = props.basePrice;
    const sz = sizes.find((s) => s.label === size);
    if (sz) t += Number(sz.modifier);
    const st = stones.find((s) => s.name === stone);
    if (st) t += Number(st.modifier);
    return t;
  }, [props.basePrice, sizes, stones, size, stone]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink">Материал изготовления</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label className="flex cursor-pointer items-start gap-2 rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <input
              type="radio"
              name="catalog-material"
              checked={material === "SILVER"}
              onChange={() => setMaterial("SILVER")}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-ink">Серебро</span>
              <span className="block text-xs text-muted">Фиксированная цена с учётом размера и вставки</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/10">
            <input
              type="radio"
              name="catalog-material"
              checked={material === "GOLD"}
              onChange={() => setMaterial("GOLD")}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-ink">Золото</span>
              <span className="block text-xs text-muted">Стоимость по договорённости</span>
            </span>
          </label>
        </div>
      </div>

      {sizes.length > 0 && (
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-ink">
            Размер
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm"
          >
            {sizes.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
                {material === "SILVER" && Number(s.modifier) !== 0
                  ? ` (+${formatRub(Number(s.modifier))})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      {stones.length > 0 && (
        <div>
          <label htmlFor="stone" className="block text-sm font-medium text-ink">
            Камень / вставка
          </label>
          <select
            id="stone"
            value={stone}
            onChange={(e) => setStone(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm"
          >
            {stones.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
                {material === "SILVER" && Number(s.modifier) !== 0
                  ? ` (+${formatRub(Number(s.modifier))})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {material === "SILVER" ? (
        <p className="text-xl font-semibold text-ink">Итого (серебро): {formatRub(silverTotal)}</p>
      ) : (
        <div className="space-y-1">
          <p className="text-xl font-semibold text-ink">Золото: по договорённости</p>
          <p className="text-sm text-muted">
            Ориентир для сравнения (серебро): {formatRub(silverTotal)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          addLine({
            type: "CATALOG",
            catalogItemId: props.catalogItemId,
            title: props.title,
            unitPrice: material === "GOLD" ? 0 : silverTotal,
            quantity: 1,
            selectedSize: sizes.length ? size : undefined,
            selectedStone: stones.length ? stone : undefined,
            selectedMaterial: material,
            imageUrl: props.imageUrl,
          })
        }
        className="rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-stone-800"
      >
        В корзину
      </button>
    </div>
  );
}
