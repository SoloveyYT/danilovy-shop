/**
 * Клиент REST API ЮKassa (без официального SDK — только fetch).
 * Документация: https://yookassa.ru/developers/api
 */

import { randomUUID } from "crypto";

export type YooCreatePaymentResult = {
  id: string;
  status: string;
  confirmation?: { confirmation_url?: string };
};

function authHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secret) {
    throw new Error("YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY должны быть заданы в .env");
  }
  const raw = Buffer.from(`${shopId}:${secret}`, "utf8").toString("base64");
  return `Basic ${raw}`;
}

export async function createYooPayment(params: {
  amountValue: string;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<YooCreatePaymentResult> {
  const idempotenceKey = randomUUID();
  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: params.amountValue, currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: params.returnUrl },
      description: params.description,
      metadata: params.metadata,
    }),
  });

  const data = (await res.json()) as YooCreatePaymentResult & { type?: string; description?: string };

  if (!res.ok) {
    const msg = JSON.stringify(data);
    throw new Error(`YooKassa error: ${res.status} ${msg}`);
  }

  return data;
}
