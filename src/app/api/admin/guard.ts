import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdminApi() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Требуется вход" }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }) };
  }
  return { user };
}
