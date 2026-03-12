"use client";
import { useSignupForm } from "./useSignupForm";

export default function SignupPage() {
  const {
    email,
    password,
    name,
    setEmail,
    setPassword,
    setName,
    error,
    success,
    loading,
    handleSubmit,
  } = useSignupForm();

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">회원가입</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border rounded px-4 py-2"
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-4 px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </main>
  );
}
