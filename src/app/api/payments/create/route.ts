import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createYooPayment } from "@/lib/yookassa";

const schema = z.object({ orderId: z.string().min(1) });

/** Создание платежа ЮKassa и редирект на оплату */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный заказ" }, { status: 422 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id },
  });
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  if (order.paymentStatus === "SUCCEEDED") {
    return NextResponse.json({ error: "Заказ уже оплачен" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${baseUrl.replace(/\/$/, "")}/account/orders?payment=success`;

  const amount = order.total.toFixed(2);

  try {
    const payment = await createYooPayment({
      amountValue: amount,
      description: `Заказ ${order.id.slice(0, 8)} — мастерская Даниловых`,
      returnUrl,
      metadata: { orderId: order.id, userId: user.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        yookassaPaymentId: payment.id,
        paymentStatus: "PENDING",
      },
    });

    const url = payment.confirmation?.confirmation_url;
    if (!url) {
      return NextResponse.json({ error: "Нет URL подтверждения оплаты" }, { status: 502 });
    }

    return NextResponse.json({ confirmationUrl: url, paymentId: payment.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка платёжного шлюза";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
