"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BuyNowButtonProps {
  productId: string;
}

export default function BuyNowButton({ productId }: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    const qty = Math.max(1, Math.min(99, Number(quantity || 1)));
    setLoading(true);
    setMessage("");
    router.push(`/checkout?mode=buy-now&productId=${productId}&quantity=${qty}`);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={99}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
        className="w-20 rounded border border-zinc-300 px-3 py-2 text-sm"
        aria-label="바로구매 수량"
      />
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
