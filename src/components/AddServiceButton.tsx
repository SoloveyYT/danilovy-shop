"use client";

import { useCart } from "./CartProvider";

export function AddServiceButton(props: {
  serviceId: string;
  title: string;
  price: number;
  imageUrl: string | null;
}) {
  const { addLine } = useCart();

  return (
    <button
      type="button"
      onClick={() =>
        addLine({
          type: "SERVICE",
          serviceId: props.serviceId,
          title: props.title,
          unitPrice: props.price,
          quantity: 1,
          imageUrl: props.imageUrl,
        })
      }
      className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-stone-800"
    >
      В корзину
    </button>
  );
}
