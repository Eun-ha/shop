import { created, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProductDto, type Product, type ProductStatus } from "@/lib/product";

type Body = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ items: items.map(toProductDto) });
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.name || !body?.price || !body?.status) {
    return fail("INVALID_REQUEST", "name, price, status are required", 400);
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      thumbnailUrl: body.thumbnailUrl ?? null,
      images: body.images ?? [],
      priceAmount: body.price.amount,
      compareAtPriceAmount: body.compareAtPrice?.amount ?? null,
      category: body.category ?? null,
      tags: body.tags ?? [],
      stock: body.stock ?? 0,
      status: body.status as ProductStatus,
    },
  });

  return created(toProductDto(product));
}
