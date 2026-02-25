import type { Cart } from "@/lib/mock-db";
import Image from "next/image";

async function fetchCart(): Promise<Cart | null> {
  // 실제 서비스에서는 인증 토큰 필요. 여기선 mock user 사용
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function CartPage() {
  const cart = await fetchCart();
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
              src={item.productId.startsWith('prod_01') ? 'https://placehold.co/600x600' : 'https://placehold.co/600x600?3'}
              alt={item.name}
              width={80}
              height={80}
              className="rounded bg-zinc-100 object-cover w-20 h-20"
            />
            <div className="flex-1">
              <div className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</div>
              <div className="text-zinc-500 text-sm">{item.price.amount.toLocaleString()}원 × {item.quantity}개</div>
            </div>
            <div className="font-bold text-blue-600 min-w-[80px] text-right">{item.lineTotal.amount.toLocaleString()}원</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-8">
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">총 합계: {cart.subtotal.amount.toLocaleString()}원</div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">주문하기</button>
      </div>
    </main>
  );
}
