"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
}

export default function BuyNowButton({ productId, quantity }: BuyNowButtonProps) {
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleBuyNow = async () => {
    if (!initialized || !token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/buy-now`, {
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

      const data = (await res.json()) as { checkoutUrl?: string; intentId?: string };
      router.push(data.checkoutUrl || `/checkout?mode=buy-now&intentId=${encodeURIComponent(data.intentId || "")}`);
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
