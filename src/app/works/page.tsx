import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getImageList } from "@/lib/image-list";
import { ThumbGallery } from "@/components/ThumbGallery";

export const metadata: Metadata = {
  title: "Примеры работ",
};

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const works = await prisma.workExample.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Примеры работ</h1>
      <p className="mt-4 max-w-2xl text-muted">Работы мастерской — фотографии выполненных заказов и реставраций.</p>

      <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w) => {
          const imgs = getImageList(w.imageUrlsJson, w.imageUrl);
          return (
            <li key={w.id} className="card-jewel overflow-hidden p-4">
              <ThumbGallery images={imgs} alt={w.title} />
              {(w.category || "").trim() ? (
                <p className="mt-3 text-xs uppercase tracking-wider text-accent">{w.category}</p>
              ) : null}
              <h2 className="font-display mt-1 text-lg font-semibold text-ink">{w.title}</h2>
              {w.description ? <p className="mt-2 text-sm text-muted">{w.description}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
