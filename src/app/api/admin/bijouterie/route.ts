import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { writeAdminLog } from "@/lib/admin-log";
import { requireAdminApi } from "../guard";

export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;
  const items = await prisma.bijouterieItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ items });
}

const createSchema = z.object({
  article: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.union([z.number(), z.string()]),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrlsJson: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: Request) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const d = parsed.data;
  try {
    const item = await prisma.bijouterieItem.create({
      data: {
        article: d.article.trim(),
        title: d.title.trim(),
        description: (d.description ?? "").trim(),
        category: (d.category ?? "").trim(),
        price: String(d.price),
        stock: d.stock ?? 0,
        imageUrl: d.imageUrl?.trim() || null,
        imageUrlsJson: d.imageUrlsJson ?? "[]",
        sortOrder: d.sortOrder ?? 0,
        isActive: d.isActive ?? true,
      },
    });
    await writeAdminLog(g.user, "bijouterie.create", {
      id: item.id,
      article: item.article,
      title: item.title,
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Не удалось создать (артикул занят?)" }, { status: 400 });
  }
}
