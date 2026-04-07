"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import { parseApiErrorMessage } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AdminProductNewPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const ui = useAsyncUiState();
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ui.start();
    if (!initialized || !isAuthenticated) {
      ui.fail("관리자 로그인이 필요합니다.");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: { amount: Number(price), currency: "KRW" },
        stock: Number(stock),
        status,
      }),
    });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      ui.fail(await parseApiErrorMessage(res, "상품 등록에 실패했습니다."));
    }

  };

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-on-surface">상품 등록</h1>
      {ui.message && <div className="mb-4 text-sale">{ui.message}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          type="text"
          placeholder="상품명"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          type="number"
          placeholder="가격(원)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <input
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          type="number"
          placeholder="재고"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />
        <select
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="ACTIVE">판매중</option>
          <option value="INACTIVE">비활성</option>
          <option value="SOLD_OUT">품절</option>
        </select>
        <Button type="submit" size="lg" className="mt-4" disabled={ui.loading}>
          {ui.loading ? "등록 중..." : "상품 등록"}
        </Button>
      </form>
    </main>
  );
}
