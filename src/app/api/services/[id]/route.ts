import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await prisma.service.findFirst({ where: { id, isActive: true } });
  if (!s) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ service: s });
}
