"use client";

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

  return (
    <div className="space-y-4">
      <p className="text-xl font-semibold text-ink">{formatRub(props.price)}</p>
      {props.stock > 0 ? (
        <p className="text-sm text-muted">В наличии: {props.stock} шт.</p>
      ) : (
        <p className="text-sm text-red-700">Нет в наличии</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          addLine({
            type: "BIJOUTERIE",
            bijouterieItemId: props.id,
            title: props.title,
            unitPrice: props.price,
            quantity: 1,
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
