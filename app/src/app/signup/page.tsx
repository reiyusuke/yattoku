"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type SignupResponse = {
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

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    const redirect = searchParams.get("redirect");
    return redirect && redirect.startsWith("/") ? redirect : null;
  }, [searchParams]);

  const loginHref = useMemo(() => {
    if (!redirectTo) {
      return "/login";
    }
    return `/login?redirect=${encodeURIComponent(redirectTo)}`;
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

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          nickname: nickname.trim(),
        }),
      });

      const data = (await response.json()) as SignupResponse;

      if (!response.ok || !data.ok || !data.user) {
        switch (data.error) {
          case "email_required":
            throw new Error("メールアドレスを入力してください。");
          case "password_required":
            throw new Error("パスワードを入力してください。");
          case "password_too_short":
            throw new Error("パスワードは8文字以上で入力してください。");
          case "invalid_email":
            throw new Error("メールアドレスの形式が不正です。");
          case "email_domain_not_allowed":
            throw new Error("大学メールアドレスのみ登録できます。");
          case "email_already_exists":
            throw new Error("このメールアドレスはすでに登録されています。");
          default:
            throw new Error("新規登録に失敗しました。");
        }
      }

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      router.push("/events");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "新規登録に失敗しました。"
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
            <p className="text-sm font-medium text-neutral-500">SIGNUP</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">新規登録</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              大学メールアドレスでアカウントを作成します。
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className="text-sm font-medium text-neutral-700">
                名前
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例: 吉元侑佑"
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                大学メールアドレス
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
                placeholder="8文字以上"
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
              {isSubmitting ? "登録中..." : "新規登録"}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-5">
            <p className="text-sm text-neutral-600">
              すでにアカウントをお持ちの場合は{" "}
              <Link href={loginHref} className="font-medium text-neutral-900 underline">
                ログイン
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
