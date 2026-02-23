import { ok, fail, parseJson } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { products } from "@/lib/mock-db";
import type { Product } from "@/lib/mock-db";

type PatchBody = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth) return fail("UNAUTHORIZED", "Unauthorized", 401);
  if (auth.role !== "ADMIN") return fail("FORBIDDEN", "Forbidden", 403);

  const existing = products.get(ctx.params.id);
  if (!existing) return fail("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const body = await parseJson<PatchBody>(req).catch(() => null);
  if (!body) return fail("INVALID_REQUEST", "Invalid body", 400);

  const next: Product = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  products.set(existing.id, next);
  return ok(next);
}