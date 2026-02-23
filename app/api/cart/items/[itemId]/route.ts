import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { getOrCreateCart, products, calcSubtotal } from "@/lib/mock-db";

type PatchBody = { quantity: number };

export async function PATCH(req: Request, ctx: { params: { itemId: string } }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<PatchBody>(req).catch(() => null);
  const qty = body?.quantity;
  if (!qty) return fail("INVALID_REQUEST", "quantity is required", 400);

  const cart = getOrCreateCart(auth.sub);
  const item = cart.items.find((it) => it.itemId === ctx.params.itemId);
  if (!item) return fail("CART_ITEM_NOT_FOUND", "Cart item not found.", 404);

  const p = products.get(item.productId);
  if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const nextQty = Math.max(1, Math.min(99, qty));
  if (p.stock < nextQty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: p.stock });

  item.quantity = nextQty;
  item.lineTotal = { ...item.lineTotal, amount: item.price.amount * nextQty };

  cart.subtotal = calcSubtotal(cart.items);
  cart.updatedAt = new Date().toISOString();

  return ok(cart);
}

export async function DELETE(req: Request, ctx: { params: { itemId: string } }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const cart = getOrCreateCart(auth.sub);
  const idx = cart.items.findIndex((it) => it.itemId === ctx.params.itemId);
  if (idx === -1) return fail("CART_ITEM_NOT_FOUND", "Cart item not found.", 404);

  cart.items.splice(idx, 1);
  cart.subtotal = calcSubtotal(cart.items);
  cart.updatedAt = new Date().toISOString();

  return ok(cart);
}