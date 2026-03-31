"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type LoginResponse = {
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    const redirect = searchParams.get("redirect");
    return redirect && redirect.startsWith("/") ? redirect : null;
  }, [searchParams]);

  const signupHref = useMemo(() => {
    if (!redirectTo) {
      return "/signup";
    }
    return `/signup?redirect=${encodeURIComponent(redirectTo)}`;
  }, [redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("メールアドレスを入力してください。");
      return;
    }

    if (!password) {
      setError("パスワードを入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok || !data.user) {
        if (data.error === "invalid_credentials") {
          throw new Error("メールアドレスまたはパスワードが正しくありません。");
        }

        throw new Error("ログインに失敗しました。");
      }

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      if (data.user.role === "admin") {
        router.push("/admin/events");
        return;
      }

      router.push("/events");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ログインに失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← ホームへ戻る
          </Link>

          <div>
            <p className="text-sm font-medium text-neutral-500">LOGIN</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">ログイン</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              登録済みの大学メールアドレスでログインします。
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: test@osaka-ue.ac.jp"
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                isSubmitting
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-5">
            <p className="text-sm text-neutral-600">
              アカウントをお持ちでない場合は{" "}
              <Link href={signupHref} className="font-medium text-neutral-900 underline">
                新規登録
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
