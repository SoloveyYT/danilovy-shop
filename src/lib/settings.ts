import { prisma } from "./prisma";
import {
  DEFAULT_ADDRESS,
  DEFAULT_PHONE,
  DEFAULT_SCHEDULE,
  DEFAULT_COURIER_FEE,
  DEFAULT_PERSONAL_MAX_URL,
  DEFAULT_SOCIAL_MAX_URL,
  DEFAULT_SOCIAL_TELEGRAM_URL,
  DEFAULT_SOCIAL_VK_URL,
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
  /** Паблик Telegram */
  socialTelegramUrl: string;
  /** Сообщество / канал в MAX */
  socialMaxUrl: string;
  /** Группа ВКонтакте */
  socialVkUrl: string;
  /** Ссылка-приглашение в мессенджер MAX */
  personalMaxUrl: string;
  /** Telegram: полный https://t.me/... или @username */
  personalTelegram: string;
  /** Дополнительный личный номер (если задан в настройках) */
  personalPhoneBackup: string;
};

const K = {
  address: "shop_address",
  phone: "shop_phone",
  schedule: "shop_schedule_json",
  courierFee: "courier_fee_rub",
  yandexMap: "yandex_map_embed_url",
  jewelryCategories: "jewelry_categories_json",
  socialTelegram: "social_telegram_url",
  socialMax: "social_max_url",
  socialVk: "social_vk_url",
  personalMax: "personal_max_url",
  personalTelegram: "personal_telegram",
  personalPhoneBackup: "personal_phone_backup",
} as const;

/** Нормализация Telegram для href */
export function telegramHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const u = t.replace(/^@/, "").replace(/^t\.me\//i, "");
  return `https://t.me/${u}`;
}

/** Внешняя ссылка (MAX, VK): добавить https:// при необходимости */
export function externalHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, "")}`;
}

/** Поиск по организации на карте, а не только по адресу здания */
function getDefaultYandexMapUrl(address: string): string {
  const text = encodeURIComponent(`${SHOP_NAME}, ${address}`);
  return `https://yandex.ru/map-widget/v1/?text=${text}&z=16`;
}

/**
 * В админке часто вставляют URL без https:// — тогда iframe грузит путь на СВОЁМ домене (/yandex.ru/...) и даёт 404.
 */
function normalizeYandexMapEmbedUrl(raw: string | undefined, addressForFallback: string): string {
  const fallback = getDefaultYandexMapUrl(addressForFallback);
  const t = raw?.trim() ?? "";
  if (!t) return fallback;
  if (/^https:\/\//i.test(t)) return t;
  if (/^http:\/\//i.test(t)) return t.replace(/^http:/i, "https:");
  if (t.startsWith("//")) return `https:${t}`;
  // только путь на текущем сайте — не внешний embed
  if (t.startsWith("/")) return fallback;
  return `https://${t.replace(/^\/+/, "")}`;
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

  const personalMax =
    map[K.personalMax]?.trim() || DEFAULT_PERSONAL_MAX_URL;

  const socialTelegram =
    map[K.socialTelegram]?.trim() || DEFAULT_SOCIAL_TELEGRAM_URL;
  const socialMax = map[K.socialMax]?.trim() || DEFAULT_SOCIAL_MAX_URL;
  const socialVk = map[K.socialVk]?.trim() || DEFAULT_SOCIAL_VK_URL;

  return {
    address: map[K.address]?.trim() || DEFAULT_ADDRESS,
    phone: map[K.phone]?.trim() || DEFAULT_PHONE,
    scheduleLines,
    courierFeeRub,
    yandexMapEmbedUrl: normalizeYandexMapEmbedUrl(
      map[K.yandexMap],
      map[K.address]?.trim() || DEFAULT_ADDRESS,
    ),
    jewelryCategories: parseJewelryCategoriesJson(map[K.jewelryCategories]),
    socialTelegramUrl: socialTelegram,
    socialMaxUrl: socialMax,
    socialVkUrl: socialVk,
    personalMaxUrl: personalMax,
    personalTelegram: map[K.personalTelegram]?.trim() ?? "",
    personalPhoneBackup: map[K.personalPhoneBackup]?.trim() ?? "",
  };
}

/** Категории изделий для фильтров и форм (тот же источник, что и в публичных настройках). */
export async function getJewelryCategories(): Promise<string[]> {
  const s = await getPublicSettings();
  return s.jewelryCategories;
}
