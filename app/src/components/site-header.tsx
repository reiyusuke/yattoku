"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMe() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as MeResponse;

        if (!isMounted) {
          return;
        }

        if (response.ok && data.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMe();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-bold text-white">
            ヤ
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">ヤットク</span>
            <span className="text-xs text-neutral-500">University Event MVP</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            イベント一覧
          </Link>

          {isLoading ? null : user?.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              管理画面
            </Link>
          ) : null}

          {isLoading ? null : user ? (
            <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700">
              {user.nickname || user.email}
            </span>
          ) : (
            <>
              <Link
                href="/login"
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
