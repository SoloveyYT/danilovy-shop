import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10, "Сообщение не короче 10 символов"),
});

/**
 * Форма обратной связи.
 * В продакшене здесь можно отправить письмо (SMTP), записать в БД или в Telegram-бота.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  console.info("[contact]", parsed.data);

  return NextResponse.json({ ok: true });
}
