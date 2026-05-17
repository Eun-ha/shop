import { fail, ok, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ intentId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const { intentId } = await params;
  const intent = await prisma.buyNowIntent.findUnique({ where: { id: intentId } });
  if (!intent || intent.userId !== auth.sub) {
    return fail("BUY_NOW_INTENT_NOT_FOUND", "Buy-now intent not found.", 404);
  }

  const product = await prisma.product.findUnique({ where: { id: intent.productId } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const quantity = Math.max(1, Math.min(99, Number(intent.quantity || 0)));
  const price = { amount: product.priceAmount, currency: "KRW" as const };

  return ok({
    intentId: intent.id,
    item: {
      itemId: `buy_now_${product.id}`,
      productId: product.id,
      name: product.name,
      price,
      quantity,
      lineTotal: { ...price, amount: product.priceAmount * quantity },
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ intentId: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const { intentId } = await params;
  const body = await parseJson<{ quantity: number }>(req).catch(() => null);
  if (!body?.quantity) return fail("INVALID_REQUEST", "quantity is required", 400);

  const intent = await prisma.buyNowIntent.findUnique({ where: { id: intentId } });
  if (!intent || intent.userId !== auth.sub) {
    return fail("BUY_NOW_INTENT_NOT_FOUND", "Buy-now intent not found.", 404);
  }

  const product = await prisma.product.findUnique({ where: { id: intent.productId } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  if (product.status !== "ACTIVE") return fail("OUT_OF_STOCK", "Product is not for sale.", 409);

  const quantity = Math.max(1, Math.min(99, Number(body.quantity)));
  if (product.stock < quantity) {
    return fail("OUT_OF_STOCK", "Insufficient stock.", 409, { stock: product.stock });
  }

  await prisma.buyNowIntent.update({ where: { id: intentId }, data: { quantity } });

  const price = { amount: product.priceAmount, currency: "KRW" as const };

  return ok({
    intentId: intent.id,
    item: {
      itemId: `buy_now_${product.id}`,
      productId: product.id,
      name: product.name,
      price,
      quantity,
      lineTotal: { ...price, amount: product.priceAmount * quantity },
    },
  });
}
