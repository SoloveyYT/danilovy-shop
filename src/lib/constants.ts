/** Константы мастерской (дефолты; часть переопределяется из БД Setting) */

export const SHOP_NAME = "Ювелирная мастерская Даниловых";

export const DEFAULT_ADDRESS = "г. Москва, ул. Борисовские Пруды, д. 14, к. 4";
export const DEFAULT_PHONE = "+7-926-538-53-40";

export const DEFAULT_SCHEDULE = [
  "Пн 12:00–19:30",
  "Вт 12:00–19:30",
  "Ср 12:00–19:30",
  "Чт 12:00–16:00",
  "Пт ВЫХОДНОЙ",
  "Сб 12:00–18:00",
  "Вс 12:00–18:00",
] as const;

/** Фиксированная стоимость курьера по Москве (руб.), если не задано в Setting */
export const DEFAULT_COURIER_FEE = 500;

export const COOKIE_NAME = "danilovy_token";
