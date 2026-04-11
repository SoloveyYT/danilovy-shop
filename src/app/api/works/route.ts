import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Публичный список примеров работ */
export async function GET() {
  const works = await prisma.workExample.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ works });
}
