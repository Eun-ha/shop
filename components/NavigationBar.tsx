"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/Button";

export default function NavigationBar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const initialized = useAuthStore((state) => state.initialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="border-b border-outline bg-surface">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2 px-4 py-3">
        {initialized && isAuthenticated ? (
          <>
            {role === "ADMIN" && (
              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                관리자
              </Link>
            )}

            <Link
              href="/me"
              className="inline-flex items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              마이페이지
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="로그아웃"
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
