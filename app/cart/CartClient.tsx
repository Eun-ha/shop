"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Cart } from "@/lib/cart";
import { parseApiErrorMessage } from "@/lib/client-api";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function CartClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const {
    data: cart,
    isLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ["cart", isAuthenticated],
    enabled: initialized && isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("장바구니를 불러올 수 없습니다.");
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
      queryClient.setQueryData(["cart", isAuthenticated], updatedCart);
      queryClient.setQueryData(["checkout-cart", isAuthenticated], updatedCart);
    },
  });

  if (!initialized || isLoading) return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!isAuthenticated) return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">로그인이 필요합니다.</div>;
  if (error) return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">장바구니를 불러올 수 없습니다.</div>;
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
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-zinc-300 disabled:opacity-50"
                  disabled={item.quantity <= 1 || quantityMutation.isPending}
                  onClick={() => quantityMutation.mutate({ itemId: item.itemId, quantity: item.quantity - 1 })}
                >
                  -
                </button>
                <span className="text-sm min-w-8 text-center">{item.quantity}</span>
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-zinc-300 disabled:opacity-50"
                  disabled={item.quantity >= 99 || quantityMutation.isPending}
                  onClick={() => quantityMutation.mutate({ itemId: item.itemId, quantity: item.quantity + 1 })}
                >
                  +
                </button>
              </div>
            </div>
            <div className="font-bold text-blue-600 min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
          </div>
        ))}
      </div>
      {quantityMutation.isError && <div className="mt-4 text-sm text-red-500">{quantityMutation.error.message}</div>}
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
