"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHOP_NAME } from "@/lib/constants";
import { useCart } from "./CartProvider";

const nav = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/catalog", label: "Серебро" },
  { href: "/bijouterie", label: "Бижутерия" },
  { href: "/works", label: "Работы" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [user, setUser] = useState<{ email: string; role?: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:py-4 md:px-6">
        <Link
          href="/"
          className="font-display max-w-[58vw] truncate text-lg font-semibold tracking-tight text-ink sm:max-w-none sm:text-xl md:text-2xl"
        >
          {SHOP_NAME}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-ink"
                  : "transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/cart"
            className="relative rounded border border-stone-300/80 px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-gold hover:bg-white sm:px-3 sm:text-sm"
          >
            Корзина
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs text-cream">
                {count}
              </span>
            )}
          </Link>
          {user === undefined ? null : user ? (
            <>
              <Link href="/account/orders" className="hidden text-muted hover:text-ink sm:inline">
                Заказы
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden text-gold hover:text-ink sm:inline">
                  Админ
                </Link>
              )}
              <button
                type="button"
                className="text-xs text-muted hover:text-ink sm:text-sm"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setUser(null);
                  window.location.href = "/";
                }}
              >
                Выход
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs text-muted hover:text-ink sm:text-sm">
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded bg-ink px-2.5 py-1.5 text-xs text-cream transition hover:bg-stone-800 sm:px-3 sm:text-sm"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mr-4 whitespace-nowrap pb-0.5 text-sm ${
              pathname === item.href ? "font-semibold text-ink" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
