import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { writeAdminLog } from "@/lib/admin-log";
import { requireAdminApi } from "../guard";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Загрузка изображения товара/услуги в public/uploads */
export async function POST(req: Request) {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Допустимы JPEG, PNG, WebP, GIF" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fsPath = path.join(dir, name);
  await writeFile(fsPath, buf);

  const url = `/uploads/${name}`;
  await writeAdminLog(g.user, "upload.image", { url });
  return NextResponse.json({ url });
}
