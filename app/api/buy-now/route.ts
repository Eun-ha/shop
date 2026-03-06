import { fail, ok, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { products } from "@/lib/mock-db";

type Body = {
  productId: string;
  quantity: number;
};

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.productId || !body?.quantity) {
    return fail("INVALID_REQUEST", "productId and quantity are required", 400);
  }

  const p = products.get(body.productId);
  if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  if (p.status !== "ACTIVE") return fail("OUT_OF_STOCK", "Product is not for sale.", 409);

  const quantity = Math.max(1, Math.min(99, Number(body.quantity || 0)));
  if (p.stock < quantity) {
    return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: p.stock });
  }

  const checkoutUrl = `/checkout?mode=buy-now&productId=${encodeURIComponent(p.id)}&quantity=${quantity}`;

  return ok({
    checkoutUrl,
    item: {
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity,
    },
  });
}
