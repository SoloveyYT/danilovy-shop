"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatRub } from "@/lib/money";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-labels";

type OrderRow = {
  id: string;
  status: string;
  total: unknown;
  paymentStatus: string;
  createdAt: string;
  deliveryMethod: string;
};

export function OrdersClient() {
  const sp = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [shopPhone, setShopPhone] = useState<string | null>(null);

  useEffect(() => {
    if (sp.get("placed") === "1") {
      setMsg("Заказ принят. Мастерская свяжется с вами для согласования оплаты (наличные или перевод).");
    }
  }, [sp]);

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((d) => setShopPhone(typeof d.phone === "string" ? d.phone : null))
      .catch(() => setShopPhone(null));
  }, []);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Мои заказы</h1>
      {msg && <p className="mt-4 text-sm text-green-800">{msg}</p>}

      {shopPhone ? (
        <p className="mt-4 text-sm text-muted">
          Вопросы по оплате:{" "}
          <a href={`tel:${shopPhone.replace(/\s/g, "")}`} className="font-medium text-ink underline">
            {shopPhone}
          </a>
        </p>
      ) : null}

      {orders === null ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-muted">
          Заказов пока нет. Перейдите в{" "}
          <Link href="/services" className="link-underline">
            каталог
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-8 space-y-4 md:hidden">
            {orders.map((o) => (
              <li key={o.id} className="card-jewel p-4">
                <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("ru-RU")}</p>
                <p className="mt-1 text-sm">
                  <span className="font-medium text-ink">Статус:</span> {orderStatusLabel(o.status)}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-ink">Оплата:</span> {paymentStatusLabel(o.paymentStatus)}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-ink">Доставка:</span>{" "}
                  {o.deliveryMethod === "PICKUP" ? "Самовывоз" : "Курьер"}
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">{formatRub(o.total as number)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-muted">
                  <th className="py-2 pr-4">Дата</th>
                  <th className="py-2 pr-4">Статус</th>
                  <th className="py-2 pr-4">Оплата</th>
                  <th className="py-2 pr-4">Доставка</th>
                  <th className="py-2 pr-4">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-stone-100">
                    <td className="py-3 pr-4">{new Date(o.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="py-3 pr-4">{orderStatusLabel(o.status)}</td>
                    <td className="py-3 pr-4">{paymentStatusLabel(o.paymentStatus)}</td>
                    <td className="py-3 pr-4">{o.deliveryMethod === "PICKUP" ? "Самовывоз" : "Курьер"}</td>
                    <td className="py-3 pr-4 font-medium">{formatRub(o.total as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
