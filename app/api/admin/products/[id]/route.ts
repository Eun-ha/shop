import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProductDto, type Product, type ProductStatus } from "@/lib/product";

type PatchBody = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const params = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  return ok(toProductDto(product));
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const params = await ctx.params;
  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const body = await parseJson<PatchBody>(req).catch(() => null);
  if (!body) return fail("INVALID_REQUEST", "Invalid body", 400);

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description ?? null } : {}),
      ...(body.thumbnailUrl !== undefined ? { thumbnailUrl: body.thumbnailUrl ?? null } : {}),
      ...(body.images !== undefined ? { images: body.images } : {}),
      ...(body.price !== undefined ? { priceAmount: body.price.amount } : {}),
      ...(body.compareAtPrice !== undefined
        ? { compareAtPriceAmount: body.compareAtPrice?.amount ?? null }
        : {}),
      ...(body.category !== undefined ? { category: body.category ?? null } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.stock !== undefined ? { stock: body.stock } : {}),
      ...(body.status !== undefined ? { status: body.status as ProductStatus } : {}),
    },
  });

  return ok(toProductDto(product));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const params = await ctx.params;
  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  await prisma.product.delete({ where: { id: params.id } });
  return ok(toProductDto(existing));
}
