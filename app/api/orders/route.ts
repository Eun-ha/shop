import { ok, created, fail, parseJson, getQuery } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ShippingAddress } from "@/lib/order";
import { shippingAddressFromCartOrderInput, toOrderDto } from "@/lib/order";
import { toCartDto } from "@/lib/cart";

type CreateBody = { cartId: string; shippingAddress: ShippingAddress; note?: string };

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const q = getQuery(req);
  const page = Math.max(1, Number(q.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(q.get("limit") || 20)));

  const where = { userId: auth.sub };
  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return ok({ items: rows.map(toOrderDto), meta: { page, limit, total } });
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<CreateBody>(req).catch(() => null);
  if (!body?.cartId || !body?.shippingAddress) {
    return fail("INVALID_REQUEST", "cartId and shippingAddress are required", 400);
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: auth.sub },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.id !== body.cartId) {
    return fail("INVALID_REQUEST", "cartId mismatch", 400);
  }

  const cartDto = toCartDto(cart);
  if (cartDto.items.length === 0) {
    return fail("INVALID_REQUEST", "cart is empty", 400);
  }

  for (const it of cartDto.items) {
    const p = await prisma.product.findUnique({ where: { id: it.productId } });
    if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404, { productId: it.productId });
    if (p.stock < it.quantity) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { productId: it.productId, stock: p.stock });
  }

  const order = await prisma.order.create({
    data: shippingAddressFromCartOrderInput(cartDto, body.shippingAddress),
    include: { items: true },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return created({ order: toOrderDto(order) });
}
