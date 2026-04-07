"use client";
import { useLoginForm } from "./useLoginForm";

export default function LoginPage() {
  const { email, password, setEmail, setPassword, error, loading, handleSubmit } = useLoginForm();

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-on-surface">로그인</h1>
      {error && <div className="mb-4 text-sale">{error}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border border-outline bg-surface px-4 py-2 text-on-surface"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-4 px-8 py-3 rounded bg-primary text-on-primary font-semibold hover:opacity-90 transition"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
