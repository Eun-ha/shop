import type { CartItem, Cart } from "@/lib/cart";
import type { Money } from "@/lib/product";

export type ShippingAddress = {
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
};

export type OrderStatus = "PENDING" | "PAID" | "CANCELED";

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: Money;
  shippingAddress: ShippingAddress;
  createdAt: string;
};

type OrderRow = {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingPostalCode: string;
  createdAt: Date;
  items: {
    id: string;
    productId: string;
    name: string;
    priceAmount: number;
    quantity: number;
    lineTotalAmount: number;
  }[];
};

const KRW = (amount: number): Money => ({ amount, currency: "KRW" });

export function toOrderDto(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    items: row.items.map((item) => ({
      itemId: item.id,
      productId: item.productId,
      name: item.name,
      price: KRW(item.priceAmount),
      quantity: item.quantity,
      lineTotal: KRW(item.lineTotalAmount),
    })),
    subtotal: KRW(row.subtotalAmount),
    shippingAddress: {
      name: row.shippingName,
      phone: row.shippingPhone,
      address1: row.shippingAddress1,
      address2: row.shippingAddress2 ?? undefined,
      city: row.shippingCity,
      postalCode: row.shippingPostalCode,
    },
    createdAt: row.createdAt.toISOString(),
  };
}

export function calcSubtotalAmount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal.amount, 0);
}

export function toOrderItemCreateData(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    priceAmount: item.price.amount,
    quantity: item.quantity,
    lineTotalAmount: item.lineTotal.amount,
  }));
}

export function shippingAddressFromCartOrderInput(cart: Cart, shippingAddress: ShippingAddress) {
  return {
    userId: cart.userId,
    subtotalAmount: cart.subtotal.amount,
    shippingName: shippingAddress.name,
    shippingPhone: shippingAddress.phone,
    shippingAddress1: shippingAddress.address1,
    shippingAddress2: shippingAddress.address2 ?? null,
    shippingCity: shippingAddress.city,
    shippingPostalCode: shippingAddress.postalCode,
    items: {
      create: toOrderItemCreateData(cart.items),
    },
  };
}
