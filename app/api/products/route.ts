import { ok, getQuery } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toProductDto, type ProductStatus } from "@/lib/product";

const SORT_MAPPINGS = {
  price_asc: { priceAmount: "asc" as const },
  price_desc: { priceAmount: "desc" as const },
  createdAt_asc: { createdAt: "asc" as const },
  createdAt_desc: { createdAt: "desc" as const },
};

export async function GET(req: Request) {
  const q = getQuery(req);
  const keyword = (q.get("q") || "").toLowerCase();
  const category = q.get("category") || "";
  const sort = q.get("sort") || "createdAt_desc";
  const page = Math.max(1, Number(q.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(q.get("limit") || 20)));

  const where = {
    status: "ACTIVE" as ProductStatus,
    ...(keyword ? { name: { contains: keyword, mode: "insensitive" as const } } : {}),
    ...(category ? { category } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: SORT_MAPPINGS[sort as keyof typeof SORT_MAPPINGS] ?? SORT_MAPPINGS.createdAt_desc,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return ok({ items: items.map(toProductDto), meta: { page, limit, total } });
}
