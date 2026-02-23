export type Role = "USER" | "ADMIN";

export type Money = { amount: number; currency: "KRW" };
export type ProductStatus = "ACTIVE" | "INACTIVE" | "SOLD_OUT";

export type Product = {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  images?: string[];
  price: Money;
  compareAtPrice?: Money | null;
  category?: string;
  tags?: string[];
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type User = { id: string; email: string; name?: string; role: Role };

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

// ===== Mock storage (in-memory) =====
const nowIso = () => new Date().toISOString();
const KRW = (amount: number): Money => ({ amount, currency: "KRW" });

export const users = new Map<string, { user: User; password: string }>();
export const products = new Map<string, Product>();
export const carts = new Map<string, Cart>(); // key: userId
export const orders = new Map<string, Order>(); // key: orderId

// Seed
(function seed() {
  users.set("dev@example.com", {
    password: "password1234",
    user: { id: "user_01", email: "dev@example.com", name: "Dev", role: "USER" },
  });
  users.set("admin@example.com", {
    password: "password1234",
    user: { id: "user_admin", email: "admin@example.com", name: "Admin", role: "ADMIN" },
  });

  const p1: Product = {
    id: "prod_01",
    name: "오프화이트 티셔츠",
    description: "면 100%, 오버핏",
    thumbnailUrl: "https://placehold.co/600x600",
    images: ["https://placehold.co/600x600", "https://placehold.co/600x600?2"],
    price: KRW(19900),
    compareAtPrice: KRW(25900),
    category: "tops",
    tags: ["new", "popular"],
    stock: 32,
    status: "ACTIVE",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const p2: Product = {
    id: "prod_02",
    name: "데님 팬츠",
    description: "와이드 핏",
    thumbnailUrl: "https://placehold.co/600x600",
    images: ["https://placehold.co/600x600?3"],
    price: KRW(49000),
    compareAtPrice: null,
    category: "bottoms",
    tags: ["basic"],
    stock: 5,
    status: "ACTIVE",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  products.set(p1.id, p1);
  products.set(p2.id, p2);
})();

// helpers
export function calcSubtotal(items: CartItem[]): Money {
  const sum = items.reduce((acc, it) => acc + it.lineTotal.amount, 0);
  return KRW(sum);
}

export function getOrCreateCart(userId: string): Cart {
  const existing = carts.get(userId);
  if (existing) return existing;
  const cart: Cart = { id: `cart_${userId}`, userId, items: [], subtotal: KRW(0), updatedAt: nowIso() };
  carts.set(userId, cart);
  return cart;
}
