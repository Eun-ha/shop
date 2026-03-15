"use client";

import { useState } from "react";
import { useAsyncUiState } from "@/lib/hooks/useAsyncUiState";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseApiErrorMessage } from "@/lib/client-api";

export function useLoginForm() {
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const ui = useAsyncUiState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ui.start();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      ui.succeed();
      window.location.href = "/";
      return;
    }

    ui.fail(await parseApiErrorMessage(res, "로그인에 실패했습니다."));
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    error: ui.isError ? ui.message : "",
    loading: ui.loading,
    handleSubmit,
  };
}
