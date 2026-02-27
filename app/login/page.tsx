"use client";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      // JWT 토큰을 localStorage에 저장 (실서비스는 httpOnly 쿠키 권장)
      localStorage.setItem("token", data.accessToken);
      window.location.href = "/";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "로그인에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">로그인</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border rounded px-4 py-2"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-4 px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
