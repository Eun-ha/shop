"use client";

import type { Cart, CartItem } from "@/lib/cart";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseApiErrorMessage } from "@/lib/client-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function useCheckoutSource() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const isBuyNow = searchParams.get("mode") === "buy-now";
  const intentId = searchParams.get("intentId") || "";

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);

  const cartQuery = useQuery<Cart>({
    queryKey: ["checkout-cart", isAuthenticated],
    enabled: initialized && isAuthenticated && !isBuyNow,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/cart`, { cache: "no-store" });
      if (!res.ok) throw new Error("장바구니를 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const buyNowQuery = useQuery<{ item: CartItem }>({
    queryKey: ["checkout-buy-now", intentId, isAuthenticated],
    enabled: initialized && isAuthenticated && isBuyNow && Boolean(intentId),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/buy-now/${encodeURIComponent(intentId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("바로구매 상품을 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const quantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await fetch(`${API_BASE_URL}/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(await parseApiErrorMessage(res, "수량 변경에 실패했습니다."));
      return (await res.json()) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["checkout-cart", isAuthenticated], updatedCart);
      queryClient.setQueryData(["cart", isAuthenticated], updatedCart);
    },
  });

  const buyNowQuantityMutation = useMutation({
    mutationFn: async ({ quantity }: { quantity: number }) => {
      const res = await fetch(`${API_BASE_URL}/api/buy-now/${encodeURIComponent(intentId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(await parseApiErrorMessage(res, "수량 변경에 실패했습니다."));
      return (await res.json()) as { intentId: string; item: CartItem };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["checkout-buy-now", intentId, isAuthenticated], { item: data.item });
    },
  });

  const items = useMemo<CartItem[]>(() => {
    if (isBuyNow) return buyNowQuery.data?.item ? [buyNowQuery.data.item] : [];
    return cartQuery.data?.items ?? [];
  }, [isBuyNow, buyNowQuery.data, cartQuery.data]);

  const isLoading = !initialized || cartQuery.isLoading || buyNowQuery.isLoading;
  const fetchError = isBuyNow ? (buyNowQuery.error?.message ?? null) : (cartQuery.error?.message ?? null);
  const invalidStateMessage = isBuyNow && !intentId ? "바로구매 정보가 없습니다. 다시 시도해 주세요." : null;
  const emptyItemsMessage = isBuyNow ? "바로구매할 상품이 없습니다." : "장바구니가 비어 있습니다.";

  return {
    items,
    isLoading,
    fetchError,
    invalidStateMessage,
    emptyItemsMessage,
    isAuthenticated,
    canEditQuantity: true,
    updateQuantity: (itemId: string, quantity: number) =>
      isBuyNow ? buyNowQuantityMutation.mutate({ quantity }) : quantityMutation.mutate({ itemId, quantity }),
    isQuantityPending: isBuyNow ? buyNowQuantityMutation.isPending : quantityMutation.isPending,
    quantityError: isBuyNow
      ? (buyNowQuantityMutation.isError ? buyNowQuantityMutation.error.message : null)
      : (quantityMutation.isError ? quantityMutation.error.message : null),
  };
}
