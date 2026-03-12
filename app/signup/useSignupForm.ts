"use client";

import { useState } from "react";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";

export function useSignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const ui = useAsyncUiState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ui.start();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (res.ok) {
      setEmail("");
      setPassword("");
      setName("");
      ui.succeed("회원가입이 완료되었습니다. 로그인 해주세요.");
      return;
    }

    const data = await res.json().catch(() => ({}));
    ui.fail(data?.message || "회원가입에 실패했습니다.");
  };

  return {
    email,
    password,
    name,
    setEmail,
    setPassword,
    setName,
    error: ui.isError ? ui.message : "",
    success: ui.isSuccess ? ui.message : "",
    loading: ui.loading,
    handleSubmit,
  };
}
