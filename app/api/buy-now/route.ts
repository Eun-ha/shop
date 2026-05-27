import { fail, ok, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  if (product.status !== "ACTIVE") return fail("PRODUCT_UNAVAILABLE", "Product is not for sale.", 409);

  const quantity = Math.max(1, Math.min(99, Number(body.quantity || 0)));
  if (product.stock < quantity) {
    return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: product.stock });
  }

  const intent = await prisma.buyNowIntent.create({
    data: {
      userId: auth.sub,
      productId: product.id,
      quantity,
    },
  });

  const checkoutUrl = `/checkout?mode=buy-now&intentId=${encodeURIComponent(intent.id)}`;

  return ok({
    checkoutUrl,
    intentId: intent.id,
  });
}
