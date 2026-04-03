import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRub } from "@/lib/money";
import { SafeImage } from "@/components/SafeImage";
import { CatalogAddToCart } from "@/components/CatalogAddToCart";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const item = await prisma.catalogItem.findFirst({ where: { id, isActive: true } });
  if (!item) return { title: "Не найдено" };
  return { title: item.title };
}

export default async function CatalogItemPage(props: Props) {
  const { id } = await props.params;
  const item = await prisma.catalogItem.findFirst({ where: { id, isActive: true } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square bg-stone-100 lg:aspect-auto lg:min-h-[420px]">
          {item.imageUrl ? (
            <SafeImage src={item.imageUrl} alt={item.title} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">Нет фото</div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gold">арт. {item.article}</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-ink md:text-4xl">{item.title}</h1>
          {item.description ? (
            <p className="mt-4 text-muted leading-relaxed">{item.description}</p>
          ) : null}

          <div className="mt-8 border-t border-stone-200 pt-8">
            <CatalogAddToCart
              catalogItemId={item.id}
              title={item.title}
              basePrice={Number(item.basePrice)}
              sizesJson={item.sizesJson}
              stonesJson={item.stonesJson}
              imageUrl={item.imageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
