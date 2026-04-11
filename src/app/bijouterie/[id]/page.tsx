import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImageList } from "@/lib/image-list";
import { ThumbGallery } from "@/components/ThumbGallery";
import { BijouterieAddToCart } from "@/components/BijouterieAddToCart";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const item = await prisma.bijouterieItem.findFirst({ where: { id, isActive: true } });
  if (!item) return { title: "Не найдено" };
  return { title: item.title };
}

export default async function BijouterieItemPage(props: Props) {
  const { id } = await props.params;
  const item = await prisma.bijouterieItem.findFirst({ where: { id, isActive: true } });
  if (!item) notFound();

  const images = getImageList(item.imageUrlsJson, item.imageUrl);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <ThumbGallery images={images} alt={item.title} aspectClassName="aspect-square lg:min-h-[420px]" />
        <div>
          {(item.category || "").trim() ? (
            <p className="text-xs uppercase tracking-wider text-accent">{item.category}</p>
          ) : null}
          <p className="text-xs uppercase tracking-wider text-gold">арт. {item.article}</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-ink md:text-4xl">{item.title}</h1>
          {item.description ? (
            <p className="mt-4 text-muted leading-relaxed">{item.description}</p>
          ) : null}

          <div className="mt-8 border-t border-stone-200 pt-8">
            <BijouterieAddToCart
              id={item.id}
              title={item.title}
              price={Number(item.price)}
              stock={item.stock}
              imageUrl={item.imageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
