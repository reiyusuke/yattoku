"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type EventItem = {
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

type EventsResponse = {
  ok: boolean;
  events?: EventItem[];
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

function applicationLabel(applicationStatus: string) {
  if (applicationStatus === "open") {
    return "募集中";
  }

  if (applicationStatus === "closed") {
    return "募集終了";
  }

  return applicationStatus;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/events", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as EventsResponse;

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "failed_to_fetch_events");
        }

        if (isMounted) {
          setEvents(data.events ?? []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("イベント一覧の取得に失敗しました。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
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

    if (events.length === 0) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">
            現在表示できるイベントはありません。
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {event.title}
                  </h2>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                    {applicationLabel(event.applicationStatus)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                  {event.description}
                </p>

                <dl className="mt-4 grid gap-2 text-sm text-neutral-700">
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <dt className="min-w-16 font-medium text-neutral-500">日時</dt>
                    <dd>{formatDate(event.eventDate)}</dd>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <dt className="min-w-16 font-medium text-neutral-500">場所</dt>
                    <dd>{event.place}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex shrink-0">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }, [error, events, isLoading]);

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
            <p className="text-sm font-medium text-neutral-500">EVENTS</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              イベント一覧
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
              現在参加できる公開イベントを表示しています。
            </p>
          </div>
        </div>

        {content}
      </section>
    </main>
  );
}
