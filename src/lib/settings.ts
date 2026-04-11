import { prisma } from "./prisma";
import {
  DEFAULT_ADDRESS,
  DEFAULT_PHONE,
  DEFAULT_SCHEDULE,
  DEFAULT_COURIER_FEE,
  SHOP_NAME,
} from "./constants";
import { parseJewelryCategoriesJson } from "./product-categories";

export type PublicShopSettings = {
  address: string;
  phone: string;
  scheduleLines: string[];
  courierFeeRub: number;
  yandexMapEmbedUrl: string;
  /** Справочник категорий для каталога / бижутерии / работ (редактируется в админке) */
  jewelryCategories: string[];
};

const K = {
  address: "shop_address",
  phone: "shop_phone",
  schedule: "shop_schedule_json",
  courierFee: "courier_fee_rub",
  yandexMap: "yandex_map_embed_url",
  jewelryCategories: "jewelry_categories_json",
} as const;

/** Поиск по организации на карте, а не только по адресу здания */
function getDefaultYandexMapUrl(address: string): string {
  const text = encodeURIComponent(`${SHOP_NAME}, ${address}`);
  return `https://yandex.ru/map-widget/v1/?text=${text}&z=16`;
}

export async function getPublicSettings(): Promise<PublicShopSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(K) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  let scheduleLines: string[] = [...DEFAULT_SCHEDULE];
  try {
    const parsed = JSON.parse(map[K.schedule] || "[]") as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      scheduleLines = parsed as string[];
    }
  } catch {
    /* use default */
  }

  const fee = parseInt(map[K.courierFee] || "", 10);
  const courierFeeRub = Number.isFinite(fee) && fee >= 0 ? fee : DEFAULT_COURIER_FEE;

  return {
    address: map[K.address]?.trim() || DEFAULT_ADDRESS,
    phone: map[K.phone]?.trim() || DEFAULT_PHONE,
    scheduleLines,
    courierFeeRub,
    yandexMapEmbedUrl:
      map[K.yandexMap]?.trim() || getDefaultYandexMapUrl(map[K.address]?.trim() || DEFAULT_ADDRESS),
    jewelryCategories: parseJewelryCategoriesJson(map[K.jewelryCategories]),
  };
}

/** Категории изделий для фильтров и форм (тот же источник, что и в публичных настройках). */
export async function getJewelryCategories(): Promise<string[]> {
  const s = await getPublicSettings();
  return s.jewelryCategories;
}
