"use client";

import { useCallback, useState } from "react";

type AsyncStatus = "idle" | "loading" | "success" | "error";

export function useAsyncUiState() {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [message, setMessage] = useState("");

  const clear = useCallback(() => {
    setStatus("idle");
    setMessage("");
  }, []);

  const start = useCallback(() => {
    setStatus("loading");
    setMessage("");
  }, []);

  const fail = useCallback((nextMessage: string) => {
    setStatus("error");
    setMessage(nextMessage);
  }, []);

  const succeed = useCallback((nextMessage = "") => {
    setStatus("success");
    setMessage(nextMessage);
  }, []);

  return {
    status,
    message,
    loading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    clear,
    start,
    fail,
    succeed,
  };
}
