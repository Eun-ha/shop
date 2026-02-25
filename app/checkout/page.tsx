import type { Cart } from "@/lib/mock-db";
import Image from "next/image";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchCart(): Promise<Cart | null> {
  const url = `${API_BASE_URL}/api/cart`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function CheckoutPage() {
  const cart = await fetchCart();
  if (!cart || cart.items.length === 0) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-zinc-500">장바구니가 비어 있습니다.</div>;
  }
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">주문/결제</h1>
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
        <form className="flex flex-col gap-4">
          <input className="border rounded px-4 py-2" placeholder="이름" required />
          <input className="border rounded px-4 py-2" placeholder="연락처" required />
          <input className="border rounded px-4 py-2" placeholder="주소" required />
          <input className="border rounded px-4 py-2" placeholder="상세 주소" />
          <input className="border rounded px-4 py-2" placeholder="도시" required />
          <input className="border rounded px-4 py-2" placeholder="우편번호" required />
        </form>
      </section>
      <div className="flex justify-end">
        <button className="px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">결제하기</button>
      </div>
    </main>
  );
}
