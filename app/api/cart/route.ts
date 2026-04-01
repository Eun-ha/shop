import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCartDto } from "@/lib/cart";

type AddBody = { productId: string; quantity: number };

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (existing) return existing;

  return prisma.cart.create({
    data: {
      id: `cart_${userId}`,
      userId,
    },
    include: { items: { include: { product: true } } },
  });
}

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const cart = await getOrCreateCart(auth.sub);
  return ok(toCartDto(cart));
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<AddBody>(req).catch(() => null);
  if (!body?.productId || !body?.quantity) {
    return fail("INVALID_REQUEST", "productId and quantity are required", 400);
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  if (product.status !== "ACTIVE") return fail("OUT_OF_STOCK", "Product is not for sale.", 409);

  const qty = Math.max(1, Math.min(99, body.quantity));
  if (product.stock < qty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: product.stock });

  const cart = await getOrCreateCart(auth.sub);
  const existing = cart.items.find((item) => item.productId === product.id);

  if (existing) {
    const nextQty = existing.quantity + qty;
    if (product.stock < nextQty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: product.stock });

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: qty,
      },
    });
  }

  const nextCart = await prisma.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return ok(toCartDto(nextCart));
}
