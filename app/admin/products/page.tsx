"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setProducts(data.items || []))
      .catch(() => setError("상품 목록을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;

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
