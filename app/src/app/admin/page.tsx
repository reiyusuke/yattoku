"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DashboardEvent = {
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

type DashboardResponse = {
  ok: boolean;
  summary?: {
    totalEvents: number;
    publishedEvents: number;
    openEvents: number;
    totalApplications: number;
  };
  recentEvents?: DashboardEvent[];
  error?: string;
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

function publishLabel(status: string) {
  switch (status) {
    case "published":
      return "公開中";
    case "draft":
      return "下書き";
    case "private":
      return "非公開";
    default:
      return status;
  }
}

function applicationLabel(status: string) {
  switch (status) {
    case "open":
      return "募集中";
    case "closed":
      return "募集終了";
    default:
      return status;
  }
}

export default function AdminHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    openEvents: 0,
    totalApplications: 0,
  });
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as DashboardResponse;

        if (!response.ok || !data.ok || !data.summary) {
          throw new Error(data.error ?? "failed_to_fetch_dashboard");
        }

        if (!isMounted) {
          return;
        }

        setSummary(data.summary);
        setRecentEvents(data.recentEvents ?? []);
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("ダッシュボード情報の取得に失敗しました。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-600">ダッシュボードを読み込み中です...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">TOTAL EVENTS</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {summary.totalEvents}
            </p>
            <p className="mt-2 text-sm text-neutral-600">登録イベント総数</p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">PUBLISHED</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {summary.publishedEvents}
            </p>
            <p className="mt-2 text-sm text-neutral-600">公開中イベント数</p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">OPEN</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {summary.openEvents}
            </p>
            <p className="mt-2 text-sm text-neutral-600">募集中イベント数</p>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">APPLICATIONS</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {summary.totalApplications}
            </p>
            <p className="mt-2 text-sm text-neutral-600">総申込数</p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">EVENT MANAGEMENT</p>
                <h2 className="mt-2 text-2xl font-semibold">イベント管理</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  イベント一覧、新規作成、編集、公開状態の管理を行います。
                </p>
              </div>

              <div>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  イベント管理へ
                </Link>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">APPLICATION CHECK</p>
                <h2 className="mt-2 text-2xl font-semibold">参加者確認</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  各イベントの参加者一覧を確認し、申込状況を追えます。
                </p>
              </div>

              <div>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  一覧から確認する
                </Link>
              </div>
            </div>
          </article>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-neutral-500">RECENT EVENTS</p>
              <h2 className="text-2xl font-semibold">直近イベント</h2>
            </div>

            {recentEvents.length === 0 ? (
              <p className="text-sm text-neutral-600">
                表示できるイベントがありません。
              </p>
            ) : (
              <div className="grid gap-4">
                {recentEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {event.title}
                        </h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                          {publishLabel(event.publishStatus)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                          {applicationLabel(event.applicationStatus)}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-neutral-600">
                        {event.description}
                      </p>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-500">日時</p>
                          <p className="mt-1 text-sm font-medium text-neutral-900">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-500">場所</p>
                          <p className="mt-1 text-sm font-medium text-neutral-900">
                            {event.place}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/applications`}
                          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                          参加者一覧
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }, [error, isLoading, recentEvents, summary]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← ホームへ戻る
          </Link>

          <div>
            <p className="text-sm font-medium text-neutral-500">ADMIN DASHBOARD</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              管理ダッシュボード
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
              イベント状況と申込状況をひと目で確認できる管理トップです。
            </p>
          </div>
        </div>

        {content}
      </section>
    </main>
  );
}
