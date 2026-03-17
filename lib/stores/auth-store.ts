"use client";

import { create } from "@/lib/vendor/zustand";

type AuthStore = {
  isAuthenticated: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  setAuthenticated: (authenticated: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  initialized: false,
  initialize: async () => {
    if (typeof window === "undefined") return;

    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      set({ isAuthenticated: res.ok, initialized: true });
    } catch {
      set({ isAuthenticated: false, initialized: true });
    }
  },
  setAuthenticated: (authenticated) => {
    set({ isAuthenticated: authenticated });
  },
  clearAuth: () => {
    set({ isAuthenticated: false });
  },
}));
