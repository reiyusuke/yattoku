"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type MeResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    nickname: string | null;
    role: string;
    emailVerified: boolean;
  };
  error?: string;
};

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentPathWithQuery = useMemo(() => {
    const query = searchParams.toString();
    if (!pathname) {
      return "/";
    }
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const loginHref = useMemo(() => {
    const redirect =
      currentPathWithQuery && currentPathWithQuery !== "/login"
        ? currentPathWithQuery
        : "/events";

    return `/login?redirect=${encodeURIComponent(redirect)}`;
  }, [currentPathWithQuery]);

  async function loadMe() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as MeResponse;

      if (!response.ok || !data.ok || !data.user) {
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    loadMe();
  }, [pathname, searchParams]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);

      const shouldGoLogin = pathname?.startsWith("/admin");
      if (shouldGoLogin) {
        router.push("/login");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
      setIsLoading(false);
    }
  }

  const displayName =
    user?.nickname?.trim() || (user ? user.email.split("@")[0] : "");

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-bold text-white">
            ヤ
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">ヤットク</span>
            <span className="text-xs text-neutral-500">
              University Event MVP
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            イベント一覧
          </Link>

          {isLoading ? (
            <span className="px-3 py-2 text-sm text-neutral-400">...</span>
          ) : user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
                >
                  管理画面
                </Link>
              ) : null}

              <div className="hidden min-w-0 sm:flex max-w-[220px] flex-col px-2">
                <span className="truncate text-sm font-medium text-neutral-900">
                  {displayName}
                </span>
                <span className="truncate text-xs text-neutral-500">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isLoggingOut
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                {isLoggingOut ? "ログアウト中..." : "ログアウト"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                ログイン
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
