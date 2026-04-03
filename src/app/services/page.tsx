import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatRub } from "@/lib/money";
import { AddServiceButton } from "@/components/AddServiceButton";
import { SafeImage } from "@/components/SafeImage";

export const metadata: Metadata = {
  title: "Услуги и ремонт",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Услуги и ремонт</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Актуальные цены ориентировочные; точная стоимость после осмотра изделия. Добавьте позицию в
        корзину и оформите заказ после входа в аккаунт.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <li key={s.id} className="card-jewel flex flex-col overflow-hidden md:flex-row">
            <div className="relative h-48 w-full bg-stone-100 md:h-auto md:w-44 md:shrink-0">
              {s.imageUrl ? (
                <SafeImage
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 200px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">Нет фото</div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs uppercase tracking-wider text-gold">арт. {s.article}</p>
              <h2 className="font-display mt-1 text-xl font-semibold text-ink">{s.title}</h2>
              {s.description ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <p className="text-lg font-semibold text-ink">{formatRub(s.price)}</p>
                <AddServiceButton
                  serviceId={s.id}
                  title={s.title}
                  price={Number(s.price)}
                  imageUrl={s.imageUrl}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
