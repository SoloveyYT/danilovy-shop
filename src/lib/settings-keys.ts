/** Допустимые ключи таблицы Setting (редактирование из админки) */
export const KEYS = [
  "shop_address",
  "shop_phone",
  "shop_schedule_json",
  "courier_fee_rub",
  "yandex_map_embed_url",
  "jewelry_categories_json",
  /** Паблики мастерской: Telegram, MAX, ВКонтакте */
  "social_telegram_url",
  "social_max_url",
  "social_vk_url",
  /** Личные: MAX, Telegram (@ или URL), резервный телефон */
  "personal_max_url",
  "personal_telegram",
  "personal_phone_backup",
] as const;
