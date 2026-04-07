import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Product } from "@/lib/product";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type ProductsResponse = {
  items: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

type ProductSearchParams = {
  q?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
  limit?: string | string[];
};

function firstParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildProductListHref(nextParams: ProductSearchParams): string {
  const queryParams = new URLSearchParams();
  const q = firstParam(nextParams.q);
  const category = firstParam(nextParams.category);
  const sort = firstParam(nextParams.sort);
  const page = firstParam(nextParams.page);
  const limit = firstParam(nextParams.limit);
  if (q) queryParams.set("q", q);
  if (category) queryParams.set("category", category);
  if (sort) queryParams.set("sort", sort);
  if (page) queryParams.set("page", page);
  if (limit) queryParams.set("limit", limit);
  const query = queryParams.toString();
  return `/${query ? `?${query}` : ""}`;
}

async function fetchProducts(searchParams?: ProductSearchParams): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  const q = firstParam(searchParams?.q);
  const category = firstParam(searchParams?.category);
  const sort = firstParam(searchParams?.sort);
  const page = firstParam(searchParams?.page);
  const limit = firstParam(searchParams?.limit);
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString();
  const url = `${API_BASE_URL}/api/products${query ? `?${query}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const fallbackPage = Math.max(1, Number(page ?? "1") || 1);
  const fallbackLimit = Math.min(100, Math.max(1, Number(limit ?? "20") || 20));
  if (!res.ok) return { items: [], meta: { page: fallbackPage, limit: fallbackLimit, total: 0 } };
  const data = await res.json();
  return { items: data.items || [], meta: data.meta || { page: fallbackPage, limit: fallbackLimit, total: 0 } };
}

export default async function Home({
  searchParams,
}: {
  searchParams?: ProductSearchParams | Promise<ProductSearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const { items: products, meta } = await fetchProducts(resolvedSearchParams);
  const q = firstParam(resolvedSearchParams.q);
  const category = firstParam(resolvedSearchParams.category);
  const sort = firstParam(resolvedSearchParams.sort);
  const limit = firstParam(resolvedSearchParams.limit) ?? "20";
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const hasPrevPage = meta.page > 1;
  const hasNextPage = meta.page < totalPages;

  return (
    <main className="min-h-screen bg-background py-12 px-4 text-foreground">
      <div className="max-w-5xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-on-surface">상품 목록</h1>
        <Card className="mb-6 p-5">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="limit" value={limit} />
            <Input type="text" name="q" label="검색어" defaultValue={q ?? ""} placeholder="상품명 검색" />
            <Input type="text" name="category" label="카테고리" defaultValue={category ?? ""} placeholder="예: fashion" />
            <label className="flex flex-col gap-1 text-sm text-on-surface">
              <span className="text-xs font-medium tracking-wide text-on-surface/70">정렬</span>
              <select
                name="sort"
                defaultValue={sort ?? "createdAt_desc"}
                className="h-11 rounded-xl border border-outline bg-surface px-3 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="createdAt_desc">최신순</option>
                <option value="createdAt_asc">오래된순</option>
                <option value="price_asc">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
              </select>
            </label>
            <div className="flex items-center gap-2 md:justify-end">
              <Button type="submit" className="h-11 px-4 py-2">
                적용
              </Button>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                초기화
              </Link>
            </div>
          </form>
        </Card>
        <p className="mb-4 text-sm text-on-surface/70">
          총 {meta.total}개 · {meta.page}/{totalPages} 페이지
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-on-surface/70">상품이 없습니다.</div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={buildProductListHref({
              q,
              category,
              sort,
              page: String(Math.max(1, meta.page - 1)),
              limit: String(meta.limit),
            })}
            aria-disabled={!hasPrevPage}
            className={`rounded px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
              hasPrevPage ? "bg-primary text-on-primary hover:opacity-100" : "cursor-not-allowed bg-surface-variant text-on-surface/60"
            }`}
          >
            이전
          </Link>
          <span className="text-sm text-on-surface/70">
            {meta.page} / {totalPages}
          </span>
          <Link
            href={buildProductListHref({
              q,
              category,
              sort,
              page: String(Math.min(totalPages, meta.page + 1)),
              limit: String(meta.limit),
            })}
            aria-disabled={!hasNextPage}
            className={`rounded px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
              hasNextPage ? "bg-primary text-on-primary hover:opacity-100" : "cursor-not-allowed bg-surface-variant text-on-surface/60"
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </main>
  );
}
