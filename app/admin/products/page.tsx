"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Product } from "@/lib/mock-db";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type ProductsResponse = {
  items?: Product[];
};

export default function AdminProductsPage() {
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ["admin-products", token],
    enabled: initialized && Boolean(token),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("상품 목록을 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const products = data?.items || [];

  if (!initialized || isLoading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!token) return <div className="py-16 text-center text-red-500">관리자 로그인이 필요합니다.</div>;
  if (error) return <div className="py-16 text-center text-red-500">상품 목록을 불러올 수 없습니다.</div>;

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 관리 (관리자)</h1>
      <div className="mb-6 flex justify-end">
        <Link href="/admin/products/new" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">상품 등록</Link>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
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
                <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline">수정</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
