import Link from "next/link";
import { getPublicSettings } from "@/lib/settings";
import { SHOP_NAME } from "@/lib/constants";

export default async function HomePage() {
  const s = await getPublicSettings();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-white to-cream">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">Москва · мастерская</p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {SHOP_NAME}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Ремонт и реставрация украшений, лазерная пайка, работа с камнями, изготовление на заказ и
            серебряные изделия по каталогу — с вниманием к деталям и срокам.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/services"
              className="rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-stone-800"
            >
              Услуги и цены
            </Link>
            <Link
              href="/catalog"
              className="rounded-sm border border-stone-400 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Каталог серебра
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold text-ink">Чем мы занимаемся</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Ремонт",
              text: "Лазерная пайка, замки, размер колец, закрепка камней, родий и позолота, полировка.",
            },
            {
              title: "Изготовление",
              text: "Индивидуальные заказы, переплавка вашего металла, работа по фото и эскизам.",
            },
            {
              title: "Серебро",
              text: "Готовые модели с выбором размера и вставок — удобный каталог на сайте.",
            },
          ].map((b) => (
            <div key={b.title} className="card-jewel p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200/80 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:flex md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Приём и консультации</h2>
            <p className="mt-2 text-muted">{s.address}</p>
            <p className="mt-1">
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="font-medium text-ink link-underline">
                {s.phone}
              </a>
            </p>
          </div>
          <Link
            href="/contacts"
            className="mt-6 inline-block rounded-sm border border-ink px-5 py-2.5 text-sm font-semibold text-ink md:mt-0"
          >
            Схема проезда
          </Link>
        </div>
      </section>
    </div>
  );
}
