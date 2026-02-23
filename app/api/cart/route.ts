import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { products, getOrCreateCart, calcSubtotal } from "@/lib/mock-db";

type AddBody = { productId: string; quantity: number };

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const cart = getOrCreateCart(auth.sub);
  return ok(cart);
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<AddBody>(req).catch(() => null);
  if (!body?.productId || !body?.quantity) {
    return fail("INVALID_REQUEST", "productId and quantity are required", 400);
  }

  const p = products.get(body.productId);
  if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  if (p.status !== "ACTIVE") return fail("OUT_OF_STOCK", "Product is not for sale.", 409);

  const qty = Math.max(1, Math.min(99, body.quantity));
  if (p.stock < qty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: p.stock });

  const cart = getOrCreateCart(auth.sub);
  const existing = cart.items.find((it) => it.productId === p.id);

  if (existing) {
    const nextQty = existing.quantity + qty;
    if (p.stock < nextQty) return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: p.stock });
    existing.quantity = nextQty;
    existing.lineTotal = { ...existing.lineTotal, amount: existing.price.amount * existing.quantity };
  } else {
    cart.items.push({
      itemId: `cartitem_${Math.random().toString(16).slice(2)}`,
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: qty,
      lineTotal: { ...p.price, amount: p.price.amount * qty },
    });
  }

  cart.subtotal = calcSubtotal(cart.items);
  cart.updatedAt = new Date().toISOString();

  return ok(cart);
}