"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { User } from "@/lib/user";
import type { Order } from "@/lib/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type OrdersResponse = {
  items: Order[];
};

function formatOrderStatus(status: Order["status"]) {
  if (status === "PAID") return "결제완료";
  if (status === "CANCELED") return "취소됨";
  return "주문완료";
}

export default function MePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["me", isAuthenticated],
    enabled: initialized && isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/me`);
      if (!res.ok) throw new Error("사용자 정보를 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery<OrdersResponse>({
    queryKey: ["my-orders", isAuthenticated],
    enabled: initialized && isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/orders?limit=50`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("주문 내역을 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const completedOrders = (ordersData?.items || []).filter((order) => order.status !== "CANCELED");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    window.location.href = "/login";
  };

  if (!initialized || isLoading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!isAuthenticated) return <div className="py-16 text-center text-red-500">로그인이 필요합니다.</div>;
  if (error) return <div className="py-16 text-center text-red-500">사용자 정보를 불러올 수 없습니다.</div>;

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">마이페이지</h1>

      <section className="mb-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">내 정보</h2>
        <div className="mb-2">이메일: <span className="font-mono">{user?.email}</span></div>
        <div className="mb-2">이름: <span className="font-mono">{user?.name || "-"}</span></div>
        <div className="mb-4">권한: <span className="font-mono">{user?.role}</span></div>
        <button
          onClick={handleLogout}
          className="mt-2 px-6 py-2 rounded bg-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-400 transition"
        >
          로그아웃
        </button>
      </section>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">주문 완료 상품</h2>

        {ordersLoading && <p className="text-zinc-500">주문 내역을 불러오는 중...</p>}
        {ordersError && <p className="text-red-500">주문 내역을 불러올 수 없습니다.</p>}

        {!ordersLoading && !ordersError && completedOrders.length === 0 && (
          <p className="text-zinc-500">아직 주문한 상품이 없습니다.</p>
        )}

        {!ordersLoading && !ordersError && completedOrders.length > 0 && (
          <div className="space-y-4">
            {completedOrders.map((order) => (
              <article key={order.id} className="rounded-md border border-zinc-200 dark:border-zinc-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="font-mono text-sm text-zinc-600 dark:text-zinc-300">주문번호: {order.id}</p>
                  <p className="text-sm font-semibold text-blue-600">{formatOrderStatus(order.status)}</p>
                </div>

                <ul className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <li key={item.itemId} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-200">{item.name} · {item.quantity}개</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.lineTotal.amount.toLocaleString()}원</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap justify-between items-center gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-3 text-sm">
                  <span className="text-zinc-500">주문일: {new Date(order.createdAt).toLocaleString()}</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">총 {order.subtotal.amount.toLocaleString()}원</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
