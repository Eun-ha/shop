import { created, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { products } from "@/lib/mock-db";
import type { Product } from "@/lib/mock-db";

type Body = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const body = await parseJson<Body>(req).catch(() => null);
  if (!body?.name || !body?.price || !body?.status) {
    return fail("INVALID_REQUEST", "name, price, status are required", 400);
  }

  const id = `prod_${Math.random().toString(16).slice(2)}`;
  const now = new Date().toISOString();

  const product: Product = {
    id,
    createdAt: now,
    updatedAt: now,
    description: body.description,
    thumbnailUrl: body.thumbnailUrl,
    images: body.images ?? [],
    name: body.name,
    price: body.price,
    compareAtPrice: body.compareAtPrice ?? null,
    category: body.category,
    tags: body.tags ?? [],
    stock: body.stock ?? 0,
    status: body.status,
  };

  products.set(id, product);
  return created(product);
}