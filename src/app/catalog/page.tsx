import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getJewelryCategories } from "@/lib/settings";
import { CatalogGrid } from "./CatalogGrid";

export const metadata: Metadata = {
  title: "Каталог",
};

/** Иначе страница замирает на снимке БД с момента `npm run build` — новые фото/позиции не видны до пересборки */
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [items, categoryOptions] = await Promise.all([
    prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
    getJewelryCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Каталог</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Готовые модели: изготовление из серебра с фиксированной ценой (с учётом размера и вставок) или из
        золота — стоимость по договорённости. На странице изделия выберите материал, размер и камень; для
        серебра итог пересчитывается при оформлении заказа на сервере.
      </p>

      <CatalogGrid items={items} categoryOptions={categoryOptions} />
    </div>
  );
}
