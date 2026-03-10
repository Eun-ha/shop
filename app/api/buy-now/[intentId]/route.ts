import { fail, ok } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { buyNowIntents, products } from "@/lib/mock-db";

export async function GET(_req: Request, { params }: { params: Promise<{ intentId: string }> }) {
  const auth = requireAuth(_req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);

  const { intentId } = await params;
  const intent = buyNowIntents.get(intentId);
  if (!intent || intent.userId !== auth.sub) {
    return fail("NOT_FOUND", "Buy-now intent not found.", 404);
  }

  const p = products.get(intent.productId);
  if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const quantity = Math.max(1, Math.min(99, Number(intent.quantity || 0)));

  return ok({
    intentId: intent.id,
    item: {
      itemId: `buy_now_${p.id}`,
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity,
      lineTotal: { ...p.price, amount: p.price.amount * quantity },
    },
  });
}
