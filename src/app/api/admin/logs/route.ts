import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../guard";

const LIMIT = 300;

/** Список записей журнала админ-панели */
export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: LIMIT,
  });

  return NextResponse.json({ logs });
}
