import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/mock-db";



const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchProducts(): Promise<Product[]> {
  const url = `${API_BASE_URL}/api/products`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export default async function Home() {
  const products = await fetchProducts();
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 목록</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-zinc-500">상품이 없습니다.</div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
