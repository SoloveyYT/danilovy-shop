import { prisma } from "./prisma";
import { getPublicSettings } from "./settings";
import type { CartLine } from "./cart-types";
import { Decimal } from "@prisma/client/runtime/library";
import type { DeliveryMethod } from "@prisma/client";

type ParsedOpt = { label?: string; name?: string; modifier: string };

function parseJsonArray(raw: string): ParsedOpt[] {
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const modifier = String(o.modifier ?? "0");
        return {
          label: typeof o.label === "string" ? o.label : undefined,
          name: typeof o.name === "string" ? o.name : undefined,
          modifier,
        };
      })
      .filter(Boolean) as ParsedOpt[];
  } catch {
    return [];
  }
}

export async function priceCartLines(lines: CartLine[]): Promise<{
  subtotal: Decimal;
  items: {
    type: "SERVICE" | "CATALOG";
    serviceId?: string;
    catalogItemId?: string;
    title: string;
    quantity: number;
    unitPrice: Decimal;
    selectedSize?: string;
    selectedStone?: string;
  }[];
}> {
  const priced: {
    type: "SERVICE" | "CATALOG";
    serviceId?: string;
    catalogItemId?: string;
    title: string;
    quantity: number;
    unitPrice: Decimal;
    selectedSize?: string;
    selectedStone?: string;
  }[] = [];

  let sub = new Decimal(0);

  for (const line of lines) {
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity || 1)));

    if (line.type === "SERVICE" && line.serviceId) {
      const s = await prisma.service.findFirst({
        where: { id: line.serviceId, isActive: true },
      });
      if (!s) throw new Error(`Услуга недоступна: ${line.serviceId}`);
      const unit = new Decimal(s.price);
      sub = sub.add(unit.mul(qty));
      priced.push({
        type: "SERVICE",
        serviceId: s.id,
        title: s.title,
        quantity: qty,
        unitPrice: unit,
        selectedSize: undefined,
        selectedStone: undefined,
      });
      continue;
    }

    if (line.type === "CATALOG" && line.catalogItemId) {
      const c = await prisma.catalogItem.findFirst({
        where: { id: line.catalogItemId, isActive: true },
      });
      if (!c) throw new Error(`Товар недоступен: ${line.catalogItemId}`);

      const sizes = parseJsonArray(c.sizesJson);
      const stones = parseJsonArray(c.stonesJson);

      let extra = new Decimal(0);
      if (sizes.length > 0) {
        if (!line.selectedSize) throw new Error("Выберите размер");
        const m = sizes.find((x) => x.label === line.selectedSize);
        if (!m) throw new Error("Неверный размер");
        extra = extra.add(new Decimal(m.modifier));
      }
      if (stones.length > 0) {
        if (!line.selectedStone) throw new Error("Выберите камень");
        const m = stones.find((x) => x.name === line.selectedStone);
        if (!m) throw new Error("Неверный камень");
        extra = extra.add(new Decimal(m.modifier));
      }

      const unit = new Decimal(c.basePrice).add(extra);
      sub = sub.add(unit.mul(qty));
      priced.push({
        type: "CATALOG",
        catalogItemId: c.id,
        title: c.title,
        quantity: qty,
        unitPrice: unit,
        selectedSize: line.selectedSize,
        selectedStone: line.selectedStone,
      });
      continue;
    }

    throw new Error("Некорректная позиция корзины");
  }

  return { subtotal: sub, items: priced };
}

export async function computeOrderTotal(
  subtotal: Decimal,
  delivery: DeliveryMethod,
): Promise<{ courierFee: Decimal; total: Decimal }> {
  const settings = await getPublicSettings();
  const feeRub =
    delivery === "COURIER" ? new Decimal(settings.courierFeeRub) : new Decimal(0);
  return {
    courierFee: feeRub,
    total: subtotal.add(feeRub),
  };
}
