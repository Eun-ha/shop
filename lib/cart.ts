import type { Money } from "@/lib/product";

export type CartItem = {
  itemId: string;
  productId: string;
  name: string;
  price: Money;
  quantity: number;
  lineTotal: Money;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: Money;
  updatedAt: string;
};

type CartRow = {
  id: string;
  userId: string;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      name: string;
      priceAmount: number;
    };
  }[];
};

const KRW = (amount: number): Money => ({ amount, currency: "KRW" });

export function toCartDto(row: CartRow): Cart {
  const items = row.items.map((item) => {
    const price = KRW(item.product.priceAmount);
    return {
      itemId: item.id,
      productId: item.productId,
      name: item.product.name,
      price,
      quantity: item.quantity,
      lineTotal: KRW(item.product.priceAmount * item.quantity),
    };
  });

  const subtotalAmount = items.reduce((sum, item) => sum + item.lineTotal.amount, 0);

  return {
    id: row.id,
    userId: row.userId,
    items,
    subtotal: KRW(subtotalAmount),
    updatedAt: row.updatedAt.toISOString(),
  };
}
