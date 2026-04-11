import { NextResponse } from "next/server";
import { z } from "zod";
import { DeliveryMethod, OrderItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { priceCartLines, computeOrderTotal } from "@/lib/order-pricing";
import type { CartLine } from "@/lib/cart-types";

const lineSchema = z.object({
  key: z.string().optional(),
  type: z.enum(["SERVICE", "CATALOG", "BIJOUTERIE"]),
  serviceId: z.string().optional(),
  catalogItemId: z.string().optional(),
  bijouterieItemId: z.string().optional(),
  title: z.string(),
  unitPrice: z.number().optional(),
  quantity: z.number().int().min(1).max(99),
  selectedSize: z.string().optional(),
  selectedStone: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

const createSchema = z.object({
  lines: z.array(lineSchema).min(1, "Корзина пуста"),
  deliveryMethod: z.enum(["PICKUP", "COURIER"]),
  customerName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().optional(),
  comment: z.string().optional(),
});

/** Создание заказа (только авторизованный клиент). Цены пересчитываются на сервере. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

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
  if (d.deliveryMethod === "COURIER" && (!d.address || d.address.trim().length < 5)) {
    return NextResponse.json({ error: "Укажите адрес для курьера" }, { status: 422 });
  }

  const cartLines: CartLine[] = d.lines.map((l) => ({
    key: l.key ?? "",
    type: l.type,
    serviceId: l.serviceId,
    catalogItemId: l.catalogItemId,
    bijouterieItemId: l.bijouterieItemId,
    title: l.title,
    unitPrice: l.unitPrice ?? 0,
    quantity: l.quantity,
    selectedSize: l.selectedSize,
    selectedStone: l.selectedStone,
    imageUrl: l.imageUrl ?? undefined,
  }));

  let subtotal;
  let pricedItems;
  try {
    const r = await priceCartLines(cartLines);
    subtotal = r.subtotal;
    pricedItems = r.items;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка расчёта";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { courierFee, total } = await computeOrderTotal(
    subtotal,
    d.deliveryMethod as DeliveryMethod,
  );

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        userId: user.id,
        status: "NEW",
        deliveryMethod: d.deliveryMethod as DeliveryMethod,
        courierFee,
        subtotal,
        total,
        customerName: d.customerName.trim(),
        phone: d.phone.trim(),
        email: d.email.trim().toLowerCase(),
        address: (d.address ?? "").trim(),
        comment: (d.comment ?? "").trim(),
        paymentStatus: "PENDING",
        viewedByAdmin: false,
      },
    });

    for (const it of pricedItems) {
      const itemType =
        it.type === "SERVICE"
          ? OrderItemType.SERVICE
          : it.type === "CATALOG"
            ? OrderItemType.CATALOG
            : OrderItemType.BIJOUTERIE;

      await tx.orderItem.create({
        data: {
          orderId: o.id,
          itemType,
          serviceId: it.serviceId ?? null,
          catalogItemId: it.catalogItemId ?? null,
          bijouterieItemId: it.bijouterieItemId ?? null,
          title: it.title,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          selectedSize: it.selectedSize ?? null,
          selectedStone: it.selectedStone ?? null,
        },
      });

      if (it.type === "BIJOUTERIE" && it.bijouterieItemId) {
        await tx.bijouterieItem.update({
          where: { id: it.bijouterieItemId },
          data: { stock: { decrement: it.quantity } },
        });
      }
    }

    return o;
  });

  return NextResponse.json({ orderId: order.id, total: order.total.toString() });
}

/** История заказов текущего пользователя */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return NextResponse.json({ orders });
}
