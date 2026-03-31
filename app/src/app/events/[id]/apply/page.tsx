"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EventDetail = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  place: string;
  publishStatus: string;
  applicationStatus: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type EventDetailResponse = {
  ok: boolean;
  event?: EventDetail;
  error?: string;
};

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

type ApplyResponse = {
  ok: boolean;
  application?: {
    id: string;
    eventId: string;
    userId: string;
    inputName: string;
    status: string;
    appliedAt: string;
  };
  error?: string;
};

type ApplyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function EventApplyPage({ params }: ApplyPageProps) {
  const router = useRouter();

  const [eventId, setEventId] = useState<string>("");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [inputName, setInputName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const resolvedParams = await params;
      if (isMounted) {
        setEventId(resolvedParams.id);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      try {
        setIsCheckingAuth(true);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as MeResponse;

        if (!response.ok || !data.ok || !data.user) {
          const redirectPath = `/events/${eventId}/apply`;
          router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
          if (data.user.nickname && data.user.nickname.trim()) {
            setInputName(data.user.nickname.trim());
          }
        }
      } catch (authError) {
        console.error(authError);
        const redirectPath = `/events/${eventId}/apply`;
        router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [eventId, router]);

  useEffect(() => {
    if (!eventId || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/events/${eventId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as EventDetailResponse;

        if (!response.ok || !data.ok || !data.event) {
          if (response.status === 404) {
            throw new Error("event_not_found");
          }

          throw new Error(data.error ?? "failed_to_fetch_event");
        }

        if (isMounted) {
          setEvent(data.event);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          const message =
            fetchError instanceof Error && fetchError.message === "event_not_found"
              ? "イベントが見つかりませんでした。"
              : "イベント情報の取得に失敗しました。";

          setError(message);
          setEvent(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId, isAuthenticated]);

  async function handleSubmit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();

    if (!eventId) {
      return;
    }

    const trimmedName = inputName.trim();

    if (trimmedName.length === 0) {
      setSubmitError("名前を入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch(`/api/events/${eventId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputName: trimmedName,
        }),
      });

      const data = (await response.json()) as ApplyResponse;

      if (!response.ok || !data.ok || !data.application) {
        if (data.error === "already_applied") {
          throw new Error("already_applied");
        }

        if (data.error === "application_closed") {
          throw new Error("application_closed");
        }

        if (data.error === "input_name_required") {
          throw new Error("input_name_required");
        }

        if (data.error === "unauthorized") {
          throw new Error("unauthorized");
        }

        throw new Error(data.error ?? "failed_to_apply");
      }

      router.push(
        `/events/${eventId}/complete?applicationId=${encodeURIComponent(
          data.application.id
        )}`
      );
    } catch (submitFetchError) {
      console.error(submitFetchError);

      if (!(submitFetchError instanceof Error)) {
        setSubmitError("参加申込に失敗しました。");
        return;
      }

      switch (submitFetchError.message) {
        case "already_applied":
          setSubmitError("このイベントにはすでに申し込み済みです。");
          break;
        case "application_closed":
          setSubmitError("このイベントは現在募集終了です。");
          break;
        case "input_name_required":
          setSubmitError("名前を入力してください。");
          break;
        case "unauthorized":
          router.replace(`/login?redirect=${encodeURIComponent(`/events/${eventId}/apply`)}`);
          break;
        default:
          setSubmitError("参加申込に失敗しました。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const content = useMemo(() => {
    if (isCheckingAuth) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">ログイン状態を確認しています...</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">読み込み中です...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      );
    }

    if (!event) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">
            イベント情報を表示できません。
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">参加申込</h1>
            <p className="text-sm leading-7 text-neutral-600 md:text-base">
              名前を入力してイベント参加申込を行います。
            </p>
          </div>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="inputName"
                className="text-sm font-medium text-neutral-700"
              >
                名前
              </label>
              <input
                id="inputName"
                name="inputName"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="例: 吉元侑佑"
                maxLength={100}
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting || event.applicationStatus !== "open"}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                  isSubmitting || event.applicationStatus !== "open"
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                {isSubmitting ? "送信中..." : "参加を確定する"}
              </button>

              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                詳細へ戻る
              </Link>
            </div>
          </form>
        </section>

        <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-neutral-500">申込対象イベント</p>
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <p className="text-sm leading-6 text-neutral-600">{event.description}</p>

            <div className="mt-2 rounded-2xl bg-neutral-50 p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">日時</p>
                  <p className="mt-1 text-base font-medium text-neutral-900">
                    {formatDate(event.eventDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-500">場所</p>
                  <p className="mt-1 text-base font-medium text-neutral-900">
                    {event.place}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-500">募集状況</p>
                  <p className="mt-1 text-base font-medium text-neutral-900">
                    {event.applicationStatus === "open" ? "募集中" : "募集終了"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }, [error, event, inputName, isCheckingAuth, isLoading, isSubmitting, submitError]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href={eventId ? `/events/${eventId}` : "/events"}
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← イベント詳細へ戻る
          </Link>

          <div>
            <p className="text-sm font-medium text-neutral-500">EVENT APPLY</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              参加申込
            </h2>
          </div>
        </div>

        {content}
      </section>
    </main>
  );
}
