import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Публичный каталог бижутерии */
export async function GET() {
  const items = await prisma.bijouterieItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ items });
}
