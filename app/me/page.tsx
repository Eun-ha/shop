"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { User } from "@/lib/mock-db";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function MePage() {
  const token = useAuthStore((state) => state.token);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);
  const clearToken = useAuthStore((state) => state.clearToken);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["me", token],
    enabled: initialized && Boolean(token),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("사용자 정보를 불러올 수 없습니다.");
      return res.json();
    },
    retry: false,
  });

  const handleLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  if (!initialized || isLoading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (!token) return <div className="py-16 text-center text-red-500">로그인이 필요합니다.</div>;
  if (error) return <div className="py-16 text-center text-red-500">사용자 정보를 불러올 수 없습니다.</div>;

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">내 정보</h1>
      <div className="mb-4">이메일: <span className="font-mono">{user?.email}</span></div>
      <div className="mb-4">이름: <span className="font-mono">{user?.name || "-"}</span></div>
      <div className="mb-4">권한: <span className="font-mono">{user?.role}</span></div>
      <button onClick={handleLogout} className="mt-8 px-8 py-3 rounded bg-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-400 transition">로그아웃</button>
    </main>
  );
}
