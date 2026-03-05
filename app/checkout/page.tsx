"use client";
import type { Cart, Order, ShippingAddress } from "@/lib/mock-db";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getProductImage(productId: string) {
  return productId.startsWith("prod_01") ? "https://placehold.co/600x600" : "https://placehold.co/600x600?3";
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buy-now";
  const buyNowProductId = searchParams.get("productId") || "";
  const buyNowQuantity = Math.max(1, Math.min(99, Number(searchParams.get("quantity") || 1)));

  const [cart, setCart] = useState<Cart | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [ordered, setOrdered] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Promise.resolve().then(() => {
        setError("로그인이 필요합니다.");
        setLoading(false);
      });
      return;
    }

    if (isBuyNowMode) {
      if (!buyNowProductId) {
        setError("바로구매할 상품 정보가 없습니다.");
        setLoading(false);
        return;
      }

      fetch(`${API_BASE_URL}/api/products/${buyNowProductId}`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) return Promise.reject(res);
          return res.json() as Promise<Product>;
        })
        .then((product) => {
          setBuyNowItem({
            itemId: `buy_now_${product.id}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: buyNowQuantity,
            lineTotal: { ...product.price, amount: product.price.amount * buyNowQuantity },
          });
        })
        .catch(() => setError("바로구매 상품을 불러올 수 없습니다."))
        .finally(() => setLoading(false));

      return;
    }

    fetch(`${API_BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) return Promise.reject(res);
        return res.json();
      })
      .then(setCart)
      .catch(() => setError("장바구니를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [isBuyNowMode, buyNowProductId, buyNowQuantity]);

  const itemsToOrder = useMemo(() => {
    if (isBuyNowMode) return buyNowItem ? [buyNowItem] : [];
    return cart?.items || [];
  }, [isBuyNowMode, buyNowItem, cart]);

  const subtotalAmount = useMemo(() => itemsToOrder.reduce((sum, item) => sum + item.lineTotal.amount, 0), [itemsToOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (itemsToOrder.length === 0) {
      setError(isBuyNowMode ? "바로구매할 상품이 없습니다." : "장바구니가 비어 있습니다.");
      return;
    }

    if (!address.name || !address.phone || !address.address1 || !address.city || !address.postalCode) {
      setError("배송지 정보를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    const body = {
      items: itemsToOrder.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      shippingAddress: address,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = (await res.json()) as { order?: Order };
        setOrdered(data.order || null);
        setSuccess("주문이 완료되었습니다!");
        setCart(null);
        setBuyNowItem(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "주문 처리 중 오류가 발생했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">주문 완료</h1>
        <p className="text-green-600 mb-6">{success}</p>

        {ordered && (
          <section className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-5 mb-6 bg-white dark:bg-zinc-900">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">주문 요약</h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 space-y-1">
              <p>주문번호: {ordered.id}</p>
              <p>주문상태: {ordered.status}</p>
              <p>주문일시: {new Date(ordered.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              {ordered.items.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between text-sm">
                  <div className="text-zinc-700 dark:text-zinc-200">
                    {item.name} · {item.quantity}개
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">{item.lineTotal.amount.toLocaleString()}원</div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 text-sm text-zinc-700 dark:text-zinc-200 space-y-1 mb-4">
              <p>
                배송지: {ordered.shippingAddress.name} / {ordered.shippingAddress.phone}
              </p>
              <p>
                주소: {ordered.shippingAddress.address1}
                {ordered.shippingAddress.address2 ? ` ${ordered.shippingAddress.address2}` : ""}, {ordered.shippingAddress.city} (
                {ordered.shippingAddress.postalCode})
              </p>
            </div>

            <div className="text-right text-xl font-bold text-zinc-900 dark:text-zinc-50">총 합계: {ordered.subtotal.amount.toLocaleString()}원</div>
          </section>
        )}

        <Link href="/" className="inline-block px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          쇼핑 계속하기
        </Link>
      </main>
    );
  }

  if (loading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (error && itemsToOrder.length === 0) return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">{error}</div>;
  if (itemsToOrder.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">{isBuyNowMode ? "바로구매할 상품이 없습니다." : "장바구니가 비어 있습니다."}</div>;
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">주문/결제</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
        <div className="flex flex-col gap-4">
          {itemsToOrder.map((item) => (
            <div key={item.itemId} className="flex gap-4 items-center border-b pb-4">
              <Image src={getProductImage(item.productId)} alt={item.name} width={60} height={60} className="rounded bg-zinc-100 object-cover w-16 h-16" unoptimized />
              <div className="flex-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</div>
                <div className="text-zinc-500 text-sm">
                  {item.price.amount.toLocaleString()}원 × {item.quantity}개
                </div>
              </div>
              <div className="font-bold text-blue-600 min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">총 합계: {subtotalAmount.toLocaleString()}원</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className="border rounded px-4 py-2" name="name" placeholder="이름" value={address.name} onChange={handleChange} required />
          <input className="border rounded px-4 py-2" name="phone" placeholder="연락처" value={address.phone} onChange={handleChange} required />
          <input className="border rounded px-4 py-2" name="address1" placeholder="주소" value={address.address1} onChange={handleChange} required />
          <input className="border rounded px-4 py-2" name="address2" placeholder="상세 주소" value={address.address2} onChange={handleChange} />
          <input className="border rounded px-4 py-2" name="city" placeholder="도시" value={address.city} onChange={handleChange} required />
          <input className="border rounded px-4 py-2" name="postalCode" placeholder="우편번호" value={address.postalCode} onChange={handleChange} required />
          <button type="submit" className="mt-4 px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={submitting}>
            {submitting ? "결제 중..." : "결제하기"}
          </button>
        </form>
      </section>
    </main>
  );
}
