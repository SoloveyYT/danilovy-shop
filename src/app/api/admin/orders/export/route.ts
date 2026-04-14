import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "../../guard";

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Экспорт заказов в CSV (UTF-8 с BOM для Excel) */
export async function GET() {
  const g = await requireAdminApi();
  if ("error" in g) return g.error;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { email: true, fullName: true } } },
  });

  const headers = [
    "id",
    "createdAt",
    "status",
    "paymentStatus",
    "deliveryMethod",
    "total",
    "customerName",
    "phone",
    "email",
    "address",
    "comment",
    "userEmail",
    "items",
  ];

  const lines = [headers.join(",")];

  for (const o of orders) {
    const itemsStr = o.items
      .map(
        (i) =>
          `${i.title} x${i.quantity} @${i.unitPrice}${i.selectedSize ? ` size:${i.selectedSize}` : ""}${i.selectedStone ? ` stone:${i.selectedStone}` : ""}${i.selectedMaterial ? ` material:${i.selectedMaterial}` : ""}`,
      )
      .join("; ");
    const row = [
      o.id,
      o.createdAt.toISOString(),
      o.status,
      o.paymentStatus,
      o.deliveryMethod,
      o.total.toString(),
      o.customerName,
      o.phone,
      o.email,
      o.address,
      o.comment,
      o.user.email,
      itemsStr,
    ].map((x) => csvEscape(String(x)));
    lines.push(row.join(","));
  }

  const bom = "\uFEFF";
  const body = bom + lines.join("\r\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
