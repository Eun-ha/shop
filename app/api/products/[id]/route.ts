import { ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toProductDto } from "@/lib/product";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  return ok(toProductDto(product));
}
