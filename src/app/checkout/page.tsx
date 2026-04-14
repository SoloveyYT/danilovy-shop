"use client";

import { useCart } from "@/components/CartProvider";
import { cartHasGoldCatalog, cartSubtotalRub, formatRub } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Shop = { courierFeeRub: number; phone: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [delivery, setDelivery] = useState<"PICKUP" | "COURIER">("PICKUP");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => setShop({ courierFeeRub: d.courierFeeRub ?? 500, phone: d.phone ?? "" }))
      .catch(() => setShop({ courierFeeRub: 500, phone: "" }));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.fullName || "");
          setEmail(d.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = useMemo(() => cartSubtotalRub(lines), [lines]);
  const hasGoldCatalog = useMemo(() => cartHasGoldCatalog(lines), [lines]);

  const courierFee = delivery === "COURIER" ? (shop?.courierFeeRub ?? 500) : 0;
  const total = subtotal + courierFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (lines.length === 0) {
      setErr("Корзина пуста");
      return;
    }
    if (delivery === "COURIER" && address.trim().length < 5) {
      setErr("Укажите адрес для курьера");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          deliveryMethod: delivery,
          customerName: name,
          phone,
          email,
          address: delivery === "COURIER" ? address : "",
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Ошибка оформления");
        setLoading(false);
        return;
      }
      clear();
      router.push("/account/orders?placed=1");
    } catch {
      setErr("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">Корзина пуста. Добавьте товары перед оформлением.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Оформление заказа</h1>
      <p className="mt-2 text-sm text-muted">
        Оплата — наличными при получении или переводом по реквизитам после звонка мастерской. Телефон для связи:{" "}
        {shop?.phone ? (
          <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="font-medium text-ink underline">
            {shop.phone}
          </a>
        ) : (
          "см. раздел «Контакты»"
        )}
        .
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6 md:mt-10">
        <div>
          <p className="text-sm font-medium text-ink">Способ получения</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-start gap-2 text-sm sm:items-center">
              <input
                type="radio"
                name="d"
                checked={delivery === "PICKUP"}
                onChange={() => setDelivery("PICKUP")}
              />
              Самовывоз (бесплатно)
            </label>
            <label className="flex items-start gap-2 text-sm sm:items-center">
              <input
                type="radio"
                name="d"
                checked={delivery === "COURIER"}
                onChange={() => setDelivery("COURIER")}
              />
              Курьер по Москве ({formatRub(courierFee)})
            </label>
          </div>
        </div>

        {delivery === "COURIER" && (
          <div>
            <label htmlFor="addr" className="block text-sm font-medium text-ink">
              Адрес доставки
            </label>
            <textarea
              id="addr"
              required={delivery === "COURIER"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label htmlFor="nm" className="block text-sm font-medium text-ink">
            ФИО
          </label>
          <input
            id="nm"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="ph" className="block text-sm font-medium text-ink">
            Телефон
          </label>
          <input
            id="ph"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="em" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="em"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="cm" className="block text-sm font-medium text-ink">
            Комментарий
          </label>
          <textarea
            id="cm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-sm border border-stone-200 bg-white/80 p-4 text-sm">
          <p>Товары: {formatRub(subtotal)}</p>
          {hasGoldCatalog ? (
            <p className="mt-1 text-xs text-muted">
              Изделия из золота: стоимость по договорённости (не включена в сумму выше).
            </p>
          ) : null}
          <p className="mt-2">Доставка: {delivery === "PICKUP" ? "бесплатно" : formatRub(courierFee)}</p>
          <p className="mt-2 text-lg font-semibold text-ink">К оплате: {formatRub(total)}</p>
        </div>

        {err && <p className="text-sm text-red-700">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-ink px-8 py-3 text-sm font-semibold text-cream disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Отправка…" : "Оформить заказ"}
        </button>
      </form>
    </div>
  );
}
