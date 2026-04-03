import Link from "next/link";
import { getPublicSettings } from "@/lib/settings";
import { SHOP_NAME } from "@/lib/constants";

export async function Footer() {
  const s = await getPublicSettings();

  return (
    <footer className="border-t border-stone-200/80 bg-stone-100/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{SHOP_NAME}</p>
          <p className="mt-2 text-sm text-muted">{s.address}</p>
          <p className="mt-1 text-sm">
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="link-underline">
              {s.phone}
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">График</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {s.scheduleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Разделы</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/services" className="text-muted hover:text-ink">
                Услуги и ремонт
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="text-muted hover:text-ink">
                Каталог серебра
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="text-muted hover:text-ink">
                Контакты и карта
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200/60 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SHOP_NAME}
      </div>
    </footer>
  );
}
