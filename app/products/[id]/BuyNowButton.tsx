"use client";

import { useRouter } from "next/navigation";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseApiErrorMessage } from "@/lib/client-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
}

export default function BuyNowButton({ productId, quantity }: BuyNowButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const router = useRouter();
  const ui = useAsyncUiState();


  const handleBuyNow = async () => {
    if (!initialized || !isAuthenticated) {
      ui.fail("로그인이 필요합니다.");
      return;
    }

    ui.start();

    try {
      const res = await fetch(`${API_BASE_URL}/api/buy-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) {
        ui.fail(await parseApiErrorMessage(res, "바로구매를 시작할 수 없습니다."));
        return;
      }

      const data = (await res.json()) as { checkoutUrl?: string; intentId?: string };
      ui.succeed();
      router.push(data.checkoutUrl || `/checkout?mode=buy-now&intentId=${encodeURIComponent(data.intentId || "")}`);
    } catch {
      ui.fail("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <button
        type="button"
        className="px-6 py-3 rounded bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition disabled:bg-zinc-400"
        onClick={handleBuyNow}
        disabled={ui.loading}
      >
        {ui.loading ? "이동 중..." : "바로구매"}
      </button>
      {ui.message && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{ui.message}</p>}
    </div>
  );
}
