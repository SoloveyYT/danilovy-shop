import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRub } from "@/lib/money";
import { SafeImage } from "@/components/SafeImage";

export const metadata: Metadata = {
  title: "Каталог серебра",
};

export default async function CatalogPage() {
  const items = await prisma.catalogItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Каталог серебра</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Серебро 925 пробы. На странице изделия выберите размер и камень — цена пересчитается при
        оформлении заказа на сервере.
      </p>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="card-jewel overflow-hidden">
            <Link href={`/catalog/${item.id}`} className="block">
              <div className="relative aspect-[4/3] bg-stone-100">
                {item.imageUrl ? (
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition hover:opacity-95"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-gold">арт. {item.article}</p>
                <h2 className="font-display mt-1 text-lg font-semibold text-ink">{item.title}</h2>
                <p className="mt-3 text-sm font-medium text-ink">от {formatRub(item.basePrice)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
