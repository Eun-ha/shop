"use client";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function MePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setUser)
      .catch(() => setError("사용자 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">내 정보</h1>
      <div className="mb-4">이메일: <span className="font-mono">{user.email}</span></div>
      <div className="mb-4">이름: <span className="font-mono">{user.name || "-"}</span></div>
      <div className="mb-4">권한: <span className="font-mono">{user.role}</span></div>
      <button onClick={handleLogout} className="mt-8 px-8 py-3 rounded bg-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-400 transition">로그아웃</button>
    </main>
  );
}
