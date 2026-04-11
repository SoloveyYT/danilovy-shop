/** Русские подписи для статусов заказа и оплаты (в БД остаются англ. коды) */

export const ORDER_STATUS_RU: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  READY: "Готов к выдаче",
  ISSUED: "Выдан",
};

export const PAYMENT_STATUS_RU: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  SUCCEEDED: "Оплачен",
  CANCELED: "Отменён",
};

export function orderStatusLabel(code: string): string {
  return ORDER_STATUS_RU[code] ?? code;
}

export function paymentStatusLabel(code: string): string {
  return PAYMENT_STATUS_RU[code] ?? code;
}
