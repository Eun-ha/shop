"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import type { Product } from "@/lib/product";
import { parseApiErrorMessage } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";

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

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!initialized || !isAuthenticated) {
        throw new Error("LOGIN_REQUIRED");
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
      if (!res.ok) {
        throw new Error(await parseApiErrorMessage(res, "상품 수정에 실패했습니다."));
      }
      return res.json();
    },
    onMutate: () => {
      ui.start();
    },
    onSuccess: () => {
      router.push("/admin/products");
    },
    onError: error => {
      if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
        ui.fail("관리자 로그인이 필요합니다.");
        return;
      }

      if (error instanceof Error) {
        ui.fail(error.message);
        return;
      }

      ui.fail("네트워크 오류가 발생했습니다.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initialized || !isAuthenticated) {
        throw new Error("LOGIN_REQUIRED");
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await parseApiErrorMessage(res, "상품 삭제에 실패했습니다."));
      }
    },
    onMutate: () => {
      ui.start();
    },
    onSuccess: () => {
      router.push("/admin/products");
    },
    onError: error => {
      if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
        ui.fail("관리자 로그인이 필요합니다.");
        return;
      }

      if (error instanceof Error) {
        ui.fail(error.message);
        return;
      }

      ui.fail("네트워크 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleDelete = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    deleteMutation.mutate();
  };

  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  if (!initialized || isLoading) return <div className="py-16 text-center text-on-surface/70">로딩 중...</div>;
  if (!isAuthenticated) return <div className="py-16 text-center text-sale">관리자 로그인이 필요합니다.</div>;
  if (queryError) return <div className="py-16 text-center text-sale">상품 정보를 불러올 수 없습니다.</div>;
  if (!product) return null;

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-on-surface">상품 수정</h1>
      {ui.message && <div className="mb-4 text-sale">{ui.message}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" type="text" placeholder="상품명" value={resolvedName} onChange={e => setName(e.target.value)} required />
        <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" type="number" placeholder="가격(원)" value={resolvedPrice} onChange={e => setPrice(e.target.value)} required />
        <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" type="number" placeholder="재고" value={resolvedStock} onChange={e => setStock(e.target.value)} required />
        <select className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" value={resolvedStatus} onChange={e => setStatus(e.target.value)}>
          <option value="ACTIVE">판매중</option>
          <option value="INACTIVE">비활성</option>
          <option value="SOLD_OUT">품절</option>
        </select>
        <div className="flex gap-2 mt-4">
          <Button type="submit" size="lg" disabled={ui.loading || isMutating}>
            {ui.loading || isMutating ? "수정 중..." : "상품 수정"}
          </Button>
          <Button type="button" size="lg" className="bg-sale text-on-sale hover:bg-sale/90" onClick={handleDelete} disabled={ui.loading || isMutating}>
            삭제
          </Button>
        </div>
      </form>
    </main>
  );
}
