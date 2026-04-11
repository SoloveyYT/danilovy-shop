import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../../guard";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  viewedByAdmin: z.boolean().optional(),
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
  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.viewedByAdmin !== undefined ? { viewedByAdmin: d.viewedByAdmin } : {}),
    },
    include: { items: true, user: { select: { email: true, fullName: true } } },
  });

  return NextResponse.json({ order });
}

/** Удаление заказа (каскадно удалятся позиции) */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const { id } = await ctx.params;
  try {
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить заказ" }, { status: 400 });
  }
}
