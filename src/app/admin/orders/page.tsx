"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdmin } from "@/lib/admin-fetch";
import { formatRub } from "@/lib/money";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-labels";

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  total: unknown;
  customerName: string;
  phone: string;
  email: string;
  deliveryMethod: string;
  viewedByAdmin: boolean;
  createdAt: string;
  items: { title: string; quantity: number }[];
  user: { email: string };
};

const statuses = ["NEW", "IN_PROGRESS", "READY", "ISSUED"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const load = useCallback(() => {
    fetchAdmin("/api/admin/orders?markViewed=1")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Заказы</h1>
        <Link
          href="/api/admin/orders/export"
          className="rounded-sm border border-stone-400 px-4 py-2 text-sm font-semibold text-ink hover:bg-white"
        >
          Экспорт CSV
        </Link>
      </div>

      <ul className="mt-8 space-y-6">
        {orders.map((o) => (
          <li key={o.id} className="card-jewel p-4 text-sm sm:p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <span className="font-mono text-[11px] break-all text-muted">{o.id}</span>
                {!o.viewedByAdmin && (
                  <span className="ml-2 rounded bg-gold/20 px-2 py-0.5 text-xs text-ink">новый</span>
                )}
              </div>
              <span className="text-xs text-muted sm:text-sm">{new Date(o.createdAt).toLocaleString("ru-RU")}</span>
            </div>
            <p className="mt-2">
              <strong>{o.customerName}</strong> · {o.phone} · {o.email}
            </p>
            <p className="text-muted">
              {o.deliveryMethod === "PICKUP" ? "Самовывоз" : "Курьер"} · оплата:{" "}
              {paymentStatusLabel(o.paymentStatus)}
            </p>
            <ul className="mt-2 list-inside list-disc text-muted">
              {o.items.map((it) => (
                <li key={it.title + it.quantity}>
                  {it.title} × {it.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-ink">{formatRub(o.total as number)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-muted">Статус заказа:</label>
              <select
                value={o.status}
                onChange={async (e) => {
                  const status = e.target.value;
                  await fetchAdmin(`/api/admin/orders/${o.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                  });
                  load();
                }}
                className="rounded-sm border border-stone-300 px-2 py-1 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {orderStatusLabel(s)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-sm text-red-700 hover:underline"
                onClick={async () => {
                  if (!confirm("Удалить заказ безвозвратно?")) return;
                  const res = await fetchAdmin(`/api/admin/orders/${o.id}`, { method: "DELETE" });
                  if (res.ok) load();
                  else alert("Не удалось удалить");
                }}
              >
                Удалить заказ
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
