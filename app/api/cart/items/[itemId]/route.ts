import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCartDto } from "@/lib/cart";

type PatchBody = { quantity: number };

export async function PATCH(req: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const params = await ctx.params;
  const body = await parseJson<PatchBody>(req).catch(() => null);
  const qty = body?.quantity;
  if (!qty) return fail("INVALID_REQUEST", "quantity is required", 400);

  const item = await prisma.cartItem.findUnique({
    where: { id: params.itemId },
    include: {
      cart: true,
      product: true,
    },
  });
  if (!item || item.cart.userId !== auth.sub) return fail("CART_ITEM_NOT_FOUND", "Cart item not found.", 404);

  const nextQty = Math.max(1, Math.min(99, qty));
  if (item.product.stock < nextQty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: item.product.stock });

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: nextQty },
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: item.cartId },
    include: { items: { include: { product: true } } },
  });

  return ok(toCartDto(cart));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const params = await ctx.params;
  const item = await prisma.cartItem.findUnique({
    where: { id: params.itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== auth.sub) return fail("CART_ITEM_NOT_FOUND", "Cart item not found.", 404);

  await prisma.cartItem.delete({ where: { id: item.id } });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: item.cartId },
    include: { items: { include: { product: true } } },
  });

  return ok(toCartDto(cart));
}
