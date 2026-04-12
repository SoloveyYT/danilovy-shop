"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { formatRub } from "@/lib/money";

export function BijouterieAddToCart(props: {
  id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}) {
  const { addLine } = useCart();
  const disabled = props.stock <= 0;
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty((q) => Math.min(props.stock, Math.max(1, q)));
  }, [props.stock]);

  return (
    <div className="space-y-4">
      <p className="text-xl font-semibold text-ink">{formatRub(props.price)}</p>
      {props.stock > 0 ? (
        <p className="text-sm text-muted">В наличии: {props.stock} шт.</p>
      ) : (
        <p className="text-sm text-red-700">Нет в наличии</p>
      )}
      {props.stock > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted">Количество</label>
          <input
            type="number"
            min={1}
            max={props.stock}
            value={qty}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isFinite(v)) return;
              setQty(Math.min(props.stock, Math.max(1, Math.floor(v))));
            }}
            className="w-20 rounded-sm border border-stone-300 px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-muted">макс. {props.stock}</span>
        </div>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          addLine({
            type: "BIJOUTERIE",
            bijouterieItemId: props.id,
            title: props.title,
            unitPrice: props.price,
            quantity: qty,
            maxStock: props.stock,
            imageUrl: props.imageUrl,
          })
        }
        className="rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-stone-800 disabled:opacity-50"
      >
        В корзину
      </button>
    </div>
  );
}
