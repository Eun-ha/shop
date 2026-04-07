"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Product } from "@/lib/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type ProductsResponse = {
  items?: Product[];
};

export default function AdminProductsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ["admin-products", isAuthenticated],
    enabled: initialized && isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`);
      if (!res.ok) throw new Error("상품 목록을 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const products = data?.items || [];

  if (!initialized || isLoading) return <div className="py-16 text-center text-on-surface/70">로딩 중...</div>;
  if (!isAuthenticated) return <div className="py-16 text-center text-sale">관리자 로그인이 필요합니다.</div>;
  if (error) return <div className="py-16 text-center text-sale">상품 목록을 불러올 수 없습니다.</div>;

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-on-surface">상품 관리 (관리자)</h1>
      <div className="mb-6 flex justify-end">
        <Link href="/admin/products/new" className="px-6 py-2 rounded bg-primary text-on-primary font-semibold hover:opacity-90 transition">상품 등록</Link>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-surface-variant bg-surface-variant">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">이름</th>
            <th className="p-2 border">가격</th>
            <th className="p-2 border">재고</th>
            <th className="p-2 border">상태</th>
            <th className="p-2 border">관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2 border font-mono">{p.id}</td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.price.amount.toLocaleString()}원</td>
              <td className="p-2 border">{p.stock}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">
                <Link href={`/admin/products/${p.id}`} className="text-primary hover:underline">수정</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
