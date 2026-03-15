"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseApiErrorMessage, withAuthorization } from "@/lib/client-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
}

export default function AddToCartButton({ productId, quantity }: AddToCartButtonProps) {
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const queryClient = useQueryClient();

  const ui = useAsyncUiState();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!initialized || !token) {
        throw new Error("LOGIN_REQUIRED");
      }

      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: withAuthorization(token, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) {
        throw new Error(await parseApiErrorMessage(res, "장바구니 담기에 실패했습니다."));
      }
    },
    onMutate: () => {
      ui.start();
    },
    onSuccess: () => {
      ui.succeed("장바구니에 담았습니다.");
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["cart", token] });
      }
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
        ui.fail("로그인이 필요합니다.");
        return;
      }

      if (error instanceof Error) {
        ui.fail(error.message);
        return;
      }

      ui.fail("네트워크 오류가 발생했습니다.");
    },
  });

  return (
    <div>
      <button
        type="button"
        className="px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        onClick={() => addToCartMutation.mutate()}
        disabled={ui.loading || addToCartMutation.isPending}
      >
        {ui.loading || addToCartMutation.isPending ? "담는 중..." : "장바구니 담기"}
      </button>
      {ui.message && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{ui.message}</p>}
    </div>
  );
}
