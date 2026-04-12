"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatRub } from "@/lib/money";
import { useEffect, useMemo, useState } from "react";

export default function CartPage() {
  const { lines, removeLine, updateQty, clear } = useCart();
  const [user, setUser] = useState<{ id: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0),
    [lines],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Корзина</h1>

      {lines.length === 0 ? (
        <p className="mt-8 text-muted">
          Пока пусто. Загляните в{" "}
          <Link href="/services" className="link-underline">
            услуги
          </Link>{" "}
          или{" "}
          <Link href="/catalog" className="link-underline">
            каталог серебра
          </Link>{" "}
          /{" "}
          <Link href="/bijouterie" className="link-underline">
            бижутерия
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-stone-200">
            {lines.map((l) => (
              <li key={l.key} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
                <div>
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-sm text-muted">
                    {l.type === "CATALOG" && (l.selectedSize || l.selectedStone)
                      ? [l.selectedSize, l.selectedStone].filter(Boolean).join(" · ")
                      : l.type === "SERVICE"
                        ? "Услуга"
                        : l.type === "BIJOUTERIE"
                          ? "Бижутерия"
                          : null}
                  </p>
                  <p className="mt-2 text-sm">{formatRub(l.unitPrice)} × {l.quantity}</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <input
                    type="number"
                    min={1}
                    max={l.type === "BIJOUTERIE" && l.maxStock != null ? l.maxStock : 99}
                    value={l.quantity}
                    onChange={(e) => updateQty(l.key, Number(e.target.value))}
                    className="w-16 rounded-sm border border-stone-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(l.key)}
                    className="text-sm text-red-700 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pt-8">
            <div>
              <p className="text-sm text-muted">Промежуточный итог</p>
              <p className="text-2xl font-semibold text-ink">{formatRub(subtotal)}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button type="button" onClick={() => clear()} className="text-sm text-muted hover:text-ink">
                Очистить
              </button>
              {user === undefined ? null : user ? (
                <Link
                  href="/checkout"
                  className="rounded-sm bg-ink px-6 py-3 text-center text-sm font-semibold text-cream hover:bg-stone-800"
                >
                  Оформить заказ
                </Link>
              ) : (
                <Link
                  href="/login?next=/checkout"
                  className="rounded-sm bg-ink px-6 py-3 text-center text-sm font-semibold text-cream hover:bg-stone-800"
                >
                  Войти для оформления
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
