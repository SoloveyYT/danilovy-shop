import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await ctx.params;
  const order = await prisma.order.findFirst({
    where:
      user.role === "ADMIN" ? { id } : { id, userId: user.id },
    include: { items: true, user: { select: { email: true, fullName: true } } },
  });

  if (!order) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (user.role !== "ADMIN" && order.userId !== user.id) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
