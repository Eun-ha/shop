"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseApiErrorMessage } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
}

export default function AddToCartButton({ productId, quantity }: AddToCartButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const queryClient = useQueryClient();

  const ui = useAsyncUiState();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!initialized || !isAuthenticated) {
        throw new Error("LOGIN_REQUIRED");
      }

      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["cart", isAuthenticated] });
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
      <Button
        type="button"
        size="lg"
        onClick={() => addToCartMutation.mutate()}
        disabled={ui.loading || addToCartMutation.isPending}
      >
        {ui.loading || addToCartMutation.isPending ? "담는 중..." : "장바구니 담기"}
      </Button>
      {ui.message && <p className="mt-2 text-sm text-on-surface/70">{ui.message}</p>}
    </div>
  );
}
