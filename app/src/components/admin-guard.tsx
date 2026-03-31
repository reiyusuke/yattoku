"use client";

import Link from "next/link";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  nickname: string | null;
  role: string;
  emailVerified: boolean;
};

type MeResponse = {
  ok: boolean;
  user?: AdminUser;
  error?: string;
};

type AdminAuthContextValue = {
  user: AdminUser | null;
};

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      try {
        setIsLoading(true);
        setIsForbidden(false);
        setIsAllowed(false);
        setUser(null);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as MeResponse;

        if (!response.ok || !data.ok || !data.user) {
          const redirect = pathname || "/admin";
          router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
          return;
        }

        if (data.user.role !== "admin") {
          if (isMounted) {
            setIsForbidden(true);
          }
          return;
        }

        if (isMounted) {
          setUser(data.user);
          setIsAllowed(true);
        }
      } catch (error) {
        console.error(error);
        const redirect = pathname || "/admin";
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-600">管理権限を確認しています...</p>
          </div>
        </section>
      </main>
    );
  }

  if (isForbidden) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-red-600">FORBIDDEN</p>
                <h1 className="mt-2 text-2xl font-bold text-red-700">
                  アクセスできません
                </h1>
                <p className="mt-3 text-sm leading-6 text-red-700">
                  このページは管理者のみ利用できます。学生アカウントでは管理画面を表示できません。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  イベント一覧へ
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  ホームへ戻る
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <AdminAuthContext.Provider value={{ user }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
