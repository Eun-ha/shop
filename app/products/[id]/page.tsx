import type { Product } from "@/lib/mock-db";
import Image from "next/image";



const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchProduct(id: string): Promise<Product | null> {
  const url = `${API_BASE_URL}/api/products/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.id);
  if (!product) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">상품을 찾을 수 없습니다.</div>;
  }
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Image
            src={product.thumbnailUrl || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-lg object-cover w-full h-96 bg-zinc-100"
            unoptimized
          />
          <div className="flex gap-2 mt-2">
            {product.images?.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={product.name + " 이미지"}
                width={80}
                height={80}
                className="rounded border object-cover w-20 h-20 bg-zinc-100"
                unoptimized
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{product.name}</h2>
          <div className="text-lg text-zinc-600 dark:text-zinc-300">{product.description}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-blue-600">{product.price.amount.toLocaleString()}원</span>
            {product.compareAtPrice && (
              <span className="text-base line-through text-zinc-400">{product.compareAtPrice.amount.toLocaleString()}원</span>
            )}
          </div>
          <div className="text-sm text-zinc-500">재고: {product.stock}개</div>
          <button className="mt-4 px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">장바구니 담기</button>
        </div>
      </div>
    </main>
  );
}
