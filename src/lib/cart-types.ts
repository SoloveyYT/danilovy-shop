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
  imageUrl?: string | null;
};
