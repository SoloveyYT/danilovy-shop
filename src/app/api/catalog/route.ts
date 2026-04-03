import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Каталог серебра */
export async function GET() {
  const list = await prisma.catalogItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ items: list });
}
