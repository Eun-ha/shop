"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Cart } from "@/lib/mock-db";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function CartClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Promise.resolve().then(() => {
        setError("로그인이 필요합니다.");
        setLoading(false);
      });
      return;
    }

    fetch(`${API_BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setCart)
      .catch(() => setError("장바구니를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">로딩 중...</div>;
  if (error) return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">{error}</div>;
  if (!cart || cart.items.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">장바구니가 비어 있습니다.</div>;
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">장바구니</h1>
      <div className="flex flex-col gap-6">
        {cart.items.map((item) => (
          <div key={item.itemId} className="flex gap-4 items-center border-b pb-4">
            <Image
              src={item.productId.startsWith("prod_01") ? "https://placehold.co/600x600" : "https://placehold.co/600x600?3"}
              alt={item.name}
              width={80}
              height={80}
              className="rounded bg-zinc-100 object-cover w-20 h-20"
            />
            <div className="flex-1">
              <div className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</div>
              <div className="text-zinc-500 text-sm">
                {item.price.amount.toLocaleString()}원 × {item.quantity}개
              </div>
            </div>
            <div className="font-bold text-blue-600 min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">총 합계: {cart.subtotal.amount.toLocaleString()}원</div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          주문하기
        </button>
      </div>
    </main>
  );
}
