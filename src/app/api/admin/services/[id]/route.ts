import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../../guard";

const patchSchema = z.object({
  article: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const d = parsed.data;
  try {
    const s = await prisma.service.update({
      where: { id },
      data: {
        ...(d.article !== undefined ? { article: d.article.trim() } : {}),
        ...(d.title !== undefined ? { title: d.title.trim() } : {}),
        ...(d.description !== undefined ? { description: d.description.trim() } : {}),
        ...(d.price !== undefined ? { price: String(d.price) } : {}),
        ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl?.trim() || null } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });
    return NextResponse.json({ service: s });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;
  const { id } = await ctx.params;
  await prisma.service.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
