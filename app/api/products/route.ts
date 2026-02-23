import { ok, getQuery } from "@/lib/http";
import { products } from "@/lib/mock-db";

export async function GET(req: Request) {
  const q = getQuery(req);
  const keyword = (q.get("q") || "").toLowerCase();
  const category = q.get("category") || "";
  const sort = q.get("sort") || "createdAt_desc";
  const page = Math.max(1, Number(q.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(q.get("limit") || 20)));

  let items = Array.from(products.values()).filter((p) => p.status === "ACTIVE");

  if (keyword) items = items.filter((p) => p.name.toLowerCase().includes(keyword));
  if (category) items = items.filter((p) => (p.category || "") === category);

  items.sort((a, b) => {
    if (sort === "price_asc") return a.price.amount - b.price.amount;
    if (sort === "price_desc") return b.price.amount - a.price.amount;
    if (sort === "createdAt_asc") return a.createdAt.localeCompare(b.createdAt);
    return b.createdAt.localeCompare(a.createdAt); // createdAt_desc default
  });

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return ok({ items: paged, meta: { page, limit, total } });
}