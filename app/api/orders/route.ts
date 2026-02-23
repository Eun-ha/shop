import { ok, created, fail, parseJson, getQuery } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { getOrCreateCart, orders, products, calcSubtotal } from "@/lib/mock-db";
import type { ShippingAddress } from "@/lib/mock-db";

type CreateBody = { cartId: string; shippingAddress: ShippingAddress; note?: string };

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const q = getQuery(req);
  const page = Math.max(1, Number(q.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(q.get("limit") || 20)));

  const mine = Array.from(orders.values()).filter((o) => o.userId === auth.sub);
  // 최신순
  mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = mine.length;
  const start = (page - 1) * limit;
  const items = mine.slice(start, start + limit);

  return ok({ items, meta: { page, limit, total } });
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<CreateBody>(req).catch(() => null);
  if (!body?.cartId || !body?.shippingAddress) {
    return fail("INVALID_REQUEST", "cartId and shippingAddress are required", 400);
  }

  const cart = getOrCreateCart(auth.sub);
  if (cart.id !== body.cartId) {
    return fail("INVALID_REQUEST", "cartId mismatch", 400);
  }
  if (cart.items.length === 0) {
    return fail("INVALID_REQUEST", "cart is empty", 400);
  }

  // 재고 검증(409 충돌 시나리오 학습용)
  for (const it of cart.items) {
    const p = products.get(it.productId);
    if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404, { productId: it.productId });
    if (p.stock < it.quantity) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { productId: it.productId, stock: p.stock });
  }

  // 주문 생성 (결제 전 PENDING)
  const orderId = `ord_${Math.random().toString(16).slice(2)}`;
  const subtotal = calcSubtotal(cart.items);

  const order = {
    id: orderId,
    userId: auth.sub,
    status: "PENDING" as const,
    items: cart.items.map((x) => ({ ...x })), // copy
    subtotal,
    shippingAddress: body.shippingAddress,
    createdAt: new Date().toISOString(),
  };

  orders.set(orderId, order);

  // (선택) 주문 생성 시 재고 차감까지 하고 싶으면 여기서 차감
  // for (const it of cart.items) {
  //   const p = products.get(it.productId)!;
  //   p.stock -= it.quantity;
  //   p.updatedAt = new Date().toISOString();
  // }

  // 장바구니 비우기
  cart.items = [];
  cart.subtotal = { amount: 0, currency: "KRW" };
  cart.updatedAt = new Date().toISOString();

  return created({ order });
}