"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
}

export default function AddToCartButton({ productId, quantity }: AddToCartButtonProps) {
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddToCart = async () => {
    if (!initialized || !token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.message || "장바구니 담기에 실패했습니다.");
        return;
      }

      setMessage("장바구니에 담았습니다.");
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        onClick={handleAddToCart}
        disabled={loading}
      >
        {loading ? "담는 중..." : "장바구니 담기"}
      </button>
      {message && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>}
    </div>
  );
}
