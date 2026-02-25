"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AdminProductNewPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "상품 등록에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 등록</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border rounded px-4 py-2"
          type="text"
          placeholder="상품명"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="number"
          placeholder="가격(원)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="number"
          placeholder="재고"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />
        <select
          className="border rounded px-4 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="ACTIVE">판매중</option>
          <option value="INACTIVE">비활성</option>
          <option value="SOLD_OUT">품절</option>
        </select>
        <button
          type="submit"
          className="mt-4 px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "등록 중..." : "상품 등록"}
        </button>
      </form>
    </main>
  );
}
