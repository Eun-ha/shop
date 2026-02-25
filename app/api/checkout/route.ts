// app/api/checkout/route.ts
import { created, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { orders, products } from "@/lib/mock-db";
import type { CartItem, ShippingAddress } from "@/lib/mock-db";
import { calcSubtotal } from "@/lib/mock-db";

type Body = {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  note?: string;
};

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.items?.length || !body?.shippingAddress) {
    return fail("INVALID_REQUEST", "items and shippingAddress are required", 400);
  }

  // 1) items 검증 + 재고 체크
  const orderItems: CartItem[] = [];
  for (const it of body.items) {
    const qty = Math.max(1, Math.min(99, Number(it.quantity || 0)));
    if (!it.productId || !qty) {
      return fail("INVALID_REQUEST", "Each item needs productId and quantity", 400);
    }

    const p = products.get(it.productId);
    if (!p) {
      return fail("PRODUCT_NOT_FOUND", "Product not found.", 404, { productId: it.productId });
    }

    if (p.status !== "ACTIVE") {
      return fail("OUT_OF_STOCK", "Product is not for sale.", 409, { productId: it.productId });
    }

    if (p.stock < qty) {
      return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { productId: it.productId, stock: p.stock });
    }

    orderItems.push({
      itemId: `checkoutitem_${Math.random().toString(16).slice(2)}`,
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: qty,
      lineTotal: { ...p.price, amount: p.price.amount * qty },
    });
  }

  // 2) 주문 생성
  const orderId = `ord_${Math.random().toString(16).slice(2)}`;
  const subtotal = calcSubtotal(orderItems);

  const order = {
    id: orderId,
    userId: auth.sub,
    status: "PENDING" as const,
    items: orderItems,
    subtotal,
    shippingAddress: body.shippingAddress,
    createdAt: new Date().toISOString(),
  };

  orders.set(orderId, order);

  // (선택) 즉시구매 시점에 재고 차감을 하고 싶으면 아래 주석 해제
  // for (const it of body.items) {
  //   const p = products.get(it.productId)!;
  //   p.stock -= Math.max(1, Math.min(99, Number(it.quantity || 0)));
  //   p.updatedAt = new Date().toISOString();
  // }

  return created({ order });
}