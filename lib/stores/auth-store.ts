"use client";

import { create } from "@/lib/vendor/zustand";

type AuthStore = {
  token: string | null;
  initialized: boolean;
  initialize: () => void;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  initialized: false,
  initialize: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    set({ token, initialized: true });
  },
  setToken: (token) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", token);
    }
    set({ token });
  },
  clearToken: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    set({ token: null });
  },
}));
