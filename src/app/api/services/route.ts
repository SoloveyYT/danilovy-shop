import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Публичный список услуг (ремонт) */
export async function GET() {
  const list = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ services: list });
}
