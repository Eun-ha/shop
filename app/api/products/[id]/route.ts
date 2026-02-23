import { ok, fail } from "@/lib/http";
import { products } from "@/lib/mock-db";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const p = products.get(ctx.params.id);
  if (!p) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);
  return ok(p);
}