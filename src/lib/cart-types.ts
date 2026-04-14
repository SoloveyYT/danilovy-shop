/** Тип позиции корзины (хранится в localStorage на клиенте) */

export type CartItemType = "SERVICE" | "CATALOG" | "BIJOUTERIE";

export type CartLine = {
  /** Уникальный ключ строки в корзине */
  key: string;
  type: CartItemType;
  serviceId?: string;
  catalogItemId?: string;
  bijouterieItemId?: string;
  title: string;
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedStone?: string;
  /** Каталог: серебро (фикс. цена) или золото (по договорённости) */
  selectedMaterial?: "SILVER" | "GOLD";
  imageUrl?: string | null;
  /** Для BIJOUTERIE: макс. штук по остатку на складе (с клиента; сервер всё равно проверяет) */
  maxStock?: number;
};
