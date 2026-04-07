"use client";
import type { Cart, CartItem } from "@/lib/cart";
import type { Order } from "@/lib/order";
import FallbackImage from "@/components/FallbackImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCheckoutState } from "./useCheckoutState";
import { parseApiErrorMessage } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getProductImage(productId: string) {
  return productId.startsWith("prod_01") ? "https://placehold.co/600x600" : "https://placehold.co/600x600?3";
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isBuyNowMode = searchParams.get("mode") === "buy-now";
  const buyNowIntentId = searchParams.get("intentId") || "";

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);

  const { address, error, success, ordered, submitting, setAddressField, startSubmit, setSubmitError, setSubmitSuccess, resetMessages } =
    useCheckoutState();


  const cartQuery = useQuery<Cart>({
    queryKey: ["checkout-cart", isAuthenticated],
    enabled: initialized && isAuthenticated && !isBuyNowMode,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("장바구니를 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const buyNowQuery = useQuery<{ item: CartItem }>({
    queryKey: ["checkout-buy-now", buyNowIntentId, isAuthenticated],
    enabled: initialized && isAuthenticated && isBuyNowMode && Boolean(buyNowIntentId),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/buy-now/${encodeURIComponent(buyNowIntentId)}`, {
        cache: "no-store",
      });
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

  const itemsToOrder = useMemo(() => {
    if (isBuyNowMode) return buyNowQuery.data?.item ? [buyNowQuery.data.item] : [];
    return cartQuery.data?.items || [];
  }, [isBuyNowMode, buyNowQuery.data, cartQuery.data]);

  const subtotalAmount = useMemo(() => itemsToOrder.reduce((sum, item) => sum + item.lineTotal.amount, 0), [itemsToOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressField(e.target.name as keyof typeof address, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!isAuthenticated) {
      setSubmitError("로그인이 필요합니다.");
      return;
    }

    if (itemsToOrder.length === 0) {
      setSubmitError(isBuyNowMode ? "바로구매할 상품이 없습니다." : "장바구니가 비어 있습니다.");
      return;
    }

    if (!address.name || !address.phone || !address.address1 || !address.city || !address.postalCode) {
      setSubmitError("배송지 정보를 모두 입력해 주세요.");
      return;
    }

    startSubmit();
    const body = {
      items: itemsToOrder.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      shippingAddress: address,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = (await res.json()) as { order?: Order };
        setSubmitSuccess("주문이 완료되었습니다!", data.order || null);
      } else {
        setSubmitError(await parseApiErrorMessage(res, "주문 처리 중 오류가 발생했습니다."));
      }
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      // submitting state is managed in reducer by success/error actions
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-4 text-on-surface">주문 완료</h1>
        <p className="text-primary mb-6">{success}</p>

        {ordered && (
          <section className="rounded-lg border border-outline p-5 mb-6 bg-surface">
            <h2 className="text-lg font-semibold mb-4 text-on-surface">주문 요약</h2>
            <div className="text-sm text-on-surface/70 mb-4 space-y-1">
              <p>주문번호: {ordered.id}</p>
              <p>주문상태: {ordered.status}</p>
              <p>주문일시: {new Date(ordered.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              {ordered.items.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between text-sm">
                  <div className="text-on-surface/80">
                    {item.name} · {item.quantity}개
                  </div>
                  <div className="font-semibold text-on-surface">{item.lineTotal.amount.toLocaleString()}원</div>
                </div>
              ))}
            </div>

            <div className="border-t border-outline pt-3 text-sm text-on-surface/80 space-y-1 mb-4">
              <p>
                배송지: {ordered.shippingAddress.name} / {ordered.shippingAddress.phone}
              </p>
              <p>
                주소: {ordered.shippingAddress.address1}
                {ordered.shippingAddress.address2 ? ` ${ordered.shippingAddress.address2}` : ""}, {ordered.shippingAddress.city} (
                {ordered.shippingAddress.postalCode})
              </p>
            </div>

            <div className="text-right text-xl font-bold text-on-surface">총 합계: {ordered.subtotal.amount.toLocaleString()}원</div>
          </section>
        )}

        <Link href="/" className="inline-block px-6 py-3 rounded bg-primary text-on-primary font-semibold hover:opacity-90 transition">
          쇼핑 계속하기
        </Link>
      </main>
    );
  }

  const loading = !initialized || cartQuery.isLoading || buyNowQuery.isLoading;
  if (loading) return <div className="py-16 text-center text-on-surface/70">로딩 중...</div>;

  if (!isAuthenticated) return <div className="max-w-2xl mx-auto py-16 text-center text-sale">로그인이 필요합니다.</div>;
  if (isBuyNowMode && !buyNowIntentId) return <div className="max-w-2xl mx-auto py-16 text-center text-sale">바로구매 정보가 없습니다. 다시 시도해 주세요.</div>;

  const queryError = isBuyNowMode ? buyNowQuery.error : cartQuery.error;
  if (queryError && itemsToOrder.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-sale">{isBuyNowMode ? "바로구매 상품을 불러올 수 없습니다." : "장바구니를 불러올 수 없습니다."}</div>;
  }

  if (error && itemsToOrder.length === 0) return <div className="max-w-2xl mx-auto py-16 text-center text-sale">{error}</div>;
  if (itemsToOrder.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-on-surface/70">{isBuyNowMode ? "바로구매할 상품이 없습니다." : "장바구니가 비어 있습니다."}</div>;
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-on-surface">주문/결제</h1>
      {error && <div className="mb-4 text-sale">{error}</div>}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
        <div className="flex flex-col gap-4">
          {itemsToOrder.map((item) => (
            <div key={item.itemId} className="flex gap-4 items-center border-b pb-4">
              <FallbackImage src={getProductImage(item.productId)} alt={item.name} width={60} height={60} className="rounded bg-surface-variant object-cover w-16 h-16" unoptimized />
              <div className="flex-1">
                <div className="font-semibold text-on-surface">{item.name}</div>
                <div className="text-on-surface/70 text-sm">
                  {item.price.amount.toLocaleString()}원 × {item.quantity}개
                </div>
                {!isBuyNowMode && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded border border-outline disabled:opacity-50"
                      disabled={item.quantity <= 1 || quantityMutation.isPending}
                      onClick={() => quantityMutation.mutate({ itemId: item.itemId, quantity: item.quantity - 1 })}
                    >
                      -
                    </button>
                    <span className="text-sm min-w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded border border-outline disabled:opacity-50"
                      disabled={item.quantity >= 99 || quantityMutation.isPending}
                      onClick={() => quantityMutation.mutate({ itemId: item.itemId, quantity: item.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div className="font-bold text-primary min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
            </div>
          ))}
        </div>
        {quantityMutation.isError && <div className="mt-3 text-sm text-sale">{quantityMutation.error.message}</div>}
        <div className="flex justify-end mt-4">
          <div className="text-xl font-bold text-on-surface">총 합계: {subtotalAmount.toLocaleString()}원</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="name" placeholder="이름" value={address.name} onChange={handleChange} required />
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="phone" placeholder="연락처" value={address.phone} onChange={handleChange} required />
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="address1" placeholder="주소" value={address.address1} onChange={handleChange} required />
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="address2" placeholder="상세 주소" value={address.address2} onChange={handleChange} />
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="city" placeholder="도시" value={address.city} onChange={handleChange} required />
          <input className="rounded border border-outline bg-surface px-4 py-2 text-on-surface" name="postalCode" placeholder="우편번호" value={address.postalCode} onChange={handleChange} required />
          <Button type="submit" size="lg" className="mt-4" disabled={submitting}>
            {submitting ? "결제 중..." : "결제하기"}
          </Button>
        </form>
      </section>
    </main>
  );
}
