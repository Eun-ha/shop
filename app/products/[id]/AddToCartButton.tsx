"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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
        body: JSON.stringify({ productId, quantity: 1 }),
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
    <div className="mt-4">
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
