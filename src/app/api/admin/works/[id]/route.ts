import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../../guard";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrlsJson: z.string().optional(),
  sortOrder: z.number().optional(),
  isPublished: z.boolean().optional(),
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
  const work = await prisma.workExample.update({
    where: { id },
    data: {
      ...(d.title !== undefined ? { title: d.title.trim() } : {}),
      ...(d.description !== undefined ? { description: d.description.trim() } : {}),
      ...(d.category !== undefined ? { category: d.category.trim() } : {}),
      ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl?.trim() || null } : {}),
      ...(d.imageUrlsJson !== undefined ? { imageUrlsJson: d.imageUrlsJson } : {}),
      ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
      ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
    },
  });
  return NextResponse.json({ work });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;
  const { id } = await ctx.params;
  await prisma.workExample.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
