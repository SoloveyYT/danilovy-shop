import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../guard";

/** Все заказы (админ). При открытии списка помечаем непросмотренные как просмотренные — опционально через query */
export async function GET(req: Request) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const { searchParams } = new URL(req.url);
  const markViewed = searchParams.get("markViewed") === "1";

  if (markViewed) {
    await prisma.order.updateMany({ where: { viewedByAdmin: false }, data: { viewedByAdmin: true } });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { email: true, fullName: true } },
    },
  });

  return NextResponse.json({ orders });
}
