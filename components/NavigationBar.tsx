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
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
            >
              S
            </span>
            쇼핑몰
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            상품 리스트
          </Link>
        </div>

        <div className="flex items-center gap-2">
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
              href="/cart"
              className="inline-flex items-center justify-center rounded-full border border-outline bg-surface px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              장바구니
            </Link>

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
        </div>
      </nav>
    </header>
  );
}
