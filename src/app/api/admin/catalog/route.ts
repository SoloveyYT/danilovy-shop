import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../guard";

export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;
  const list = await prisma.catalogItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ items: list });
}

const createSchema = z.object({
  article: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.union([z.number(), z.string()]),
  sizesJson: z.string().optional(),
  stonesJson: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
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
    const item = await prisma.catalogItem.create({
      data: {
        article: d.article.trim(),
        title: d.title.trim(),
        description: (d.description ?? "").trim(),
        basePrice: String(d.basePrice),
        sizesJson: d.sizesJson ?? "[]",
        stonesJson: d.stonesJson ?? "[]",
        imageUrl: d.imageUrl?.trim() || null,
        sortOrder: d.sortOrder ?? 0,
        isActive: d.isActive ?? true,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Не удалось создать (артикул занят?)" }, { status: 400 });
  }
}
