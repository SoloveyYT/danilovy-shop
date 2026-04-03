import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Вебхук ЮKassa (notification).
 * В личном кабинете ЮKassa укажите URL: https://ваш-домен/api/payments/webhook
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const obj = body as {
    type?: string;
    object?: { id?: string; status?: string; metadata?: Record<string, string> };
  };

  if (obj.type === "payment.succeeded" && obj.object?.metadata?.orderId) {
    const orderId = obj.object.metadata.orderId;
    await prisma.order.updateMany({
      where: { id: orderId, yookassaPaymentId: obj.object.id },
      data: { paymentStatus: "SUCCEEDED" },
    });
  }

  if (obj.type === "payment.canceled" && obj.object?.metadata?.orderId) {
    const orderId = obj.object.metadata.orderId;
    await prisma.order.updateMany({
      where: { id: orderId },
      data: { paymentStatus: "CANCELED" },
    });
  }

  return NextResponse.json({ ok: true });
}
