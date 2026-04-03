import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../guard";

/** Количество новых заказов (ещё не отмеченных просмотренными админом) */
export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const count = await prisma.order.count({ where: { viewedByAdmin: false } });
  return NextResponse.json({ newOrders: count });
}
