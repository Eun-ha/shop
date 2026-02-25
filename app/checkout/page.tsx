"use client";
import type { Cart, ShippingAddress } from "@/lib/mock-db";
import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/cart`, { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!cart || cart.items.length === 0) {
      setError("장바구니가 비어 있습니다.");
      return;
    }
    if (!address.name || !address.phone || !address.address1 || !address.city || !address.postalCode) {
      setError("배송지 정보를 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const body = {
      items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      shippingAddress: address,
    };
    const res = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSuccess("주문이 완료되었습니다!");
      setCart(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "주문 처리 중 오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!cart || cart.items.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">장바구니가 비어 있습니다.</div>;
  }
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">주문/결제</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <div key={item.itemId} className="flex gap-4 items-center border-b pb-4">
              <Image
                src={item.productId.startsWith('prod_01') ? 'https://placehold.co/600x600' : 'https://placehold.co/600x600?3'}
                alt={item.name}
                width={60}
                height={60}
                className="rounded bg-zinc-100 object-cover w-16 h-16"
                unoptimized
              />
              <div className="flex-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</div>
                <div className="text-zinc-500 text-sm">{item.price.amount.toLocaleString()}원 × {item.quantity}개</div>
              </div>
              <div className="font-bold text-blue-600 min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">총 합계: {cart.subtotal.amount.toLocaleString()}원</div>
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
