import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getJewelryCategories } from "@/lib/settings";
import { BijouterieGrid } from "./BijouterieGrid";

export const metadata: Metadata = {
  title: "Бижутерия",
};

export default async function BijouterieCatalogPage() {
  const [items, categoryOptions] = await Promise.all([
    prisma.bijouterieItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
    getJewelryCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Бижутерия</h1>
      <p className="mt-4 max-w-2xl text-muted">Готовые изделия в наличии. Количество ограничено.</p>

      <BijouterieGrid items={items} categoryOptions={categoryOptions} />
    </div>
  );
}
