import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { writeAdminLog } from "@/lib/admin-log";
import { requireAdminApi } from "../guard";

export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;
  const works = await prisma.workExample.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ works });
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrlsJson: z.string().optional(),
  sortOrder: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(req: Request) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const d = parsed.data;
  const work = await prisma.workExample.create({
    data: {
      title: d.title.trim(),
      description: (d.description ?? "").trim(),
      category: (d.category ?? "").trim(),
      imageUrl: d.imageUrl?.trim() || null,
      imageUrlsJson: d.imageUrlsJson ?? "[]",
      sortOrder: d.sortOrder ?? 0,
      isPublished: d.isPublished ?? true,
    },
  });
  await writeAdminLog(g.user, "works.create", { id: work.id, title: work.title });
  return NextResponse.json({ work });
}
