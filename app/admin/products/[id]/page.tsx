"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import type { Product } from "@/lib/mock-db";
import { parseApiErrorMessage } from "@/lib/client-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AdminProductEditPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [name, setName] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState<string | undefined>(undefined);
  const [stock, setStock] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const ui = useAsyncUiState();

  const { data: product, isLoading, error: queryError } = useQuery<Product>({
    queryKey: ["admin-product", id, isAuthenticated],
    enabled: initialized && isAuthenticated && Boolean(id),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`);
      if (!res.ok) throw new Error("상품 정보를 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const resolvedName = name ?? product?.name ?? "";
  const resolvedPrice = price ?? product?.price?.amount?.toString() ?? "";
  const resolvedStock = stock ?? product?.stock?.toString() ?? "";
  const resolvedStatus = status ?? product?.status ?? "ACTIVE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ui.start();
    if (!initialized || !isAuthenticated) {
      ui.fail("관리자 로그인이 필요합니다.");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: resolvedName,
        price: { amount: Number(resolvedPrice), currency: "KRW" },
        stock: Number(resolvedStock),
        status: resolvedStatus,
      }),
    });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      ui.fail(await parseApiErrorMessage(res, "상품 수정에 실패했습니다."));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    ui.start();
    if (!initialized || !isAuthenticated) {
      ui.fail("관리자 로그인이 필요합니다.");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      ui.fail(await parseApiErrorMessage(res, "상품 삭제에 실패했습니다."));
    }
  };

  if (!initialized || isLoading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!isAuthenticated) return <div className="py-16 text-center text-red-500">관리자 로그인이 필요합니다.</div>;
  if (queryError) return <div className="py-16 text-center text-red-500">상품 정보를 불러올 수 없습니다.</div>;
  if (!product) return null;

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 수정</h1>
      {ui.message && <div className="mb-4 text-red-500">{ui.message}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input className="border rounded px-4 py-2" type="text" placeholder="상품명" value={resolvedName} onChange={e => setName(e.target.value)} required />
        <input className="border rounded px-4 py-2" type="number" placeholder="가격(원)" value={resolvedPrice} onChange={e => setPrice(e.target.value)} required />
        <input className="border rounded px-4 py-2" type="number" placeholder="재고" value={resolvedStock} onChange={e => setStock(e.target.value)} required />
        <select className="border rounded px-4 py-2" value={resolvedStatus} onChange={e => setStatus(e.target.value)}>
          <option value="ACTIVE">판매중</option>
          <option value="INACTIVE">비활성</option>
          <option value="SOLD_OUT">품절</option>
        </select>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={ui.loading}>
            {ui.loading ? "수정 중..." : "상품 수정"}
          </button>
          <button type="button" className="px-8 py-3 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition" onClick={handleDelete} disabled={ui.loading}>
            삭제
          </button>
        </div>
      </form>
    </main>
  );
}
