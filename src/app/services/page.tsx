import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServicesGrid } from "./ServicesGrid";

export const metadata: Metadata = {
  title: "Услуги и ремонт",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Услуги и ремонт</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Актуальные цены ориентировочные; точная стоимость после осмотра изделия. Добавьте позицию в корзину и
        оформите заказ после входа в аккаунт.
      </p>

      <ServicesGrid items={services} />
    </div>
  );
}
