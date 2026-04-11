"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminHomePage() {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => setN(d.newOrders ?? 0))
      .catch(() => setN(0));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Обзор</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card-jewel p-6">
          <p className="text-sm text-muted">Новые заказы (не просмотрены)</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{n === null ? "…" : n}</p>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
            Перейти к заказам
          </Link>
        </div>
        <div className="card-jewel p-6">
          <p className="text-sm text-muted">Быстрые действия</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/admin/services" className="link-underline">
                Управление услугами
              </Link>
            </li>
            <li>
              <Link href="/admin/catalog" className="link-underline">
                Каталог серебра
              </Link>
            </li>
            <li>
              <Link href="/admin/bijouterie" className="link-underline">
                Бижутерия
              </Link>
            </li>
            <li>
              <Link href="/admin/works" className="link-underline">
                Примеры работ
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="link-underline">
                Контакты и график
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
