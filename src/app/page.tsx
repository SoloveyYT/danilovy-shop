import Link from "next/link";
import { getPublicSettings } from "@/lib/settings";
import { SHOP_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getImageList } from "@/lib/image-list";
import { SafeImage } from "@/components/SafeImage";

export default async function HomePage() {
  const s = await getPublicSettings();
  const workPreview = await prisma.workExample.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  });

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
              className="rounded-sm border border-stone-400 px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent"
            >
              Каталог серебра
            </Link>
            <Link
              href="/works"
              className="rounded-sm border border-stone-400 px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent"
            >
              Примеры работ
            </Link>
          </div>
        </div>
      </section>

      {workPreview.length > 0 && (
        <section className="border-t border-stone-200/80 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold text-ink">Примеры работ</h2>
              <Link href="/works" className="text-sm font-medium text-accent hover:underline">
                Все работы →
              </Link>
            </div>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {workPreview.map((w) => {
                const imgs = getImageList(w.imageUrlsJson, w.imageUrl);
                const src = imgs[0];
                return (
                  <li key={w.id} className="card-jewel overflow-hidden">
                    <div className="relative aspect-[4/3] bg-stone-100">
                      {src ? (
                        <SafeImage src={src} alt={w.title} fill className="object-cover" sizes="33vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">Нет фото</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-display text-lg font-semibold text-ink">{w.title}</p>
                      {w.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{w.description}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

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
