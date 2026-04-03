import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Product } from "@/lib/product";
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type ProductsResponse = {
  items: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

async function fetchProducts(rawPage?: string, rawLimit?: string): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (rawPage) params.set("page", rawPage);
  if (rawLimit) params.set("limit", rawLimit);
  const query = params.toString();
  const url = `${API_BASE_URL}/api/products${query ? `?${query}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const fallbackPage = Math.max(1, Number(rawPage ?? "1") || 1);
  const fallbackLimit = Math.min(100, Math.max(1, Number(rawLimit ?? "20") || 20));
  if (!res.ok) return { items: [], meta: { page: fallbackPage, limit: fallbackLimit, total: 0 } };
  const data = await res.json();
  return { items: data.items || [], meta: data.meta || { page: fallbackPage, limit: fallbackLimit, total: 0 } };
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const { items: products, meta } = await fetchProducts(searchParams?.page, searchParams?.limit);
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const hasPrevPage = meta.page > 1;
  const hasNextPage = meta.page < totalPages;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 목록</h1>
        <p className="mb-4 text-sm text-zinc-500">
          총 {meta.total}개 · {meta.page}/{totalPages} 페이지
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-zinc-500">상품이 없습니다.</div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={`/?page=${Math.max(1, meta.page - 1)}&limit=${meta.limit}`}
            aria-disabled={!hasPrevPage}
            className={`rounded px-4 py-2 text-sm font-medium ${
              hasPrevPage ? "bg-zinc-900 text-white hover:bg-zinc-700" : "cursor-not-allowed bg-zinc-300 text-zinc-500"
            }`}
          >
            이전
          </Link>
          <span className="text-sm text-zinc-500">
            {meta.page} / {totalPages}
          </span>
          <Link
            href={`/?page=${Math.min(totalPages, meta.page + 1)}&limit=${meta.limit}`}
            aria-disabled={!hasNextPage}
            className={`rounded px-4 py-2 text-sm font-medium ${
              hasNextPage ? "bg-zinc-900 text-white hover:bg-zinc-700" : "cursor-not-allowed bg-zinc-300 text-zinc-500"
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </main>
  );
}
