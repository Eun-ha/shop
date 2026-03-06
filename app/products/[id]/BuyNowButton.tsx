"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
}

export default function BuyNowButton({ productId, quantity }: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBuyNow = async () => {
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
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.message || "바로구매를 시작할 수 없습니다.");
        return;
      }

      router.push("/checkout");
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
        className="px-6 py-3 rounded bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition disabled:bg-zinc-400"
        onClick={handleBuyNow}
        disabled={loading}
      >
        {loading ? "이동 중..." : "바로구매"}
      </button>
      {message && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>}
    </div>
  );
}
