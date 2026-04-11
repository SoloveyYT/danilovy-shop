import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../guard";
import { KEYS } from "@/lib/settings-keys";

export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ settings: map });
}

const patchSchema = z.object({
  shop_address: z.string().optional(),
  shop_phone: z.string().optional(),
  shop_schedule_json: z.string().optional(),
  courier_fee_rub: z.string().optional(),
  yandex_map_embed_url: z.string().optional(),
  jewelry_categories_json: z.string().optional(),
});

export async function PATCH(req: Request) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const d = parsed.data;
  if (d.jewelry_categories_json !== undefined) {
    try {
      const arr = JSON.parse(d.jewelry_categories_json) as unknown;
      if (!Array.isArray(arr) || !arr.every((x) => typeof x === "string")) {
        return NextResponse.json(
          { error: "jewelry_categories_json: нужен JSON-массив строк" },
          { status: 422 },
        );
      }
    } catch {
      return NextResponse.json({ error: "jewelry_categories_json: невалидный JSON" }, { status: 400 });
    }
  }

  const entries = Object.entries(d).filter(([, v]) => v !== undefined) as [string, string][];

  for (const [key, value] of entries) {
    if (!KEYS.includes(key as (typeof KEYS)[number])) continue;
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ settings: map });
}
