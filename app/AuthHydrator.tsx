"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AuthHydrator() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

