"use client";

import { create } from "@/lib/vendor/zustand";

type AuthRole = "USER" | "ADMIN";

type SessionResponse = {
  user?: {
    role?: AuthRole;
  };
};

type AuthStore = {
  isAuthenticated: boolean;
  role: AuthRole | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  setAuthenticated: (authenticated: boolean, role?: AuthRole | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  role: null,
  initialized: false,
  initialize: async () => {
    if (typeof window === "undefined") return;

    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) {
        set({ isAuthenticated: false, role: null, initialized: true });
        return;
      }

      const data = (await res.json().catch(() => ({}))) as SessionResponse;
      const role = data.user?.role === "ADMIN" ? "ADMIN" : "USER";
      set({ isAuthenticated: true, role, initialized: true });
    } catch {
      set({ isAuthenticated: false, role: null, initialized: true });
    }
  },
  setAuthenticated: (authenticated, role = null) => {
    set({ isAuthenticated: authenticated, role: authenticated ? role : null });
  },
  clearAuth: () => {
    set({ isAuthenticated: false, role: null });
  },
}));
