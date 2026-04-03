import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/settings";

/** Публичные настройки мастерской (контакты, график, курьер) для клиентских компонентов */
export async function GET() {
  const s = await getPublicSettings();
  return NextResponse.json(s);
}
