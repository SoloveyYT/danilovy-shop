import Link from "next/link";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/catalog", label: "Каталог серебра" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/settings", label: "Настройки" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <p className="font-display text-lg font-semibold text-ink">Админ-панель</p>
          <nav className="flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted hover:text-ink">
                {l.label}
              </Link>
            ))}
            <Link href="/" className="text-gold hover:text-ink">
              На сайт
            </Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">{children}</div>
    </div>
  );
}
