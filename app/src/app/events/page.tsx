"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function applicationLabel(status: string) {
  if (status === "open") {
    return "募集中";
  }

  if (status === "closed") {
    return "募集終了";
  }

  return status;
}

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents(currentQuery: string) {
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (currentQuery.trim()) {
        params.set("q", currentQuery.trim());
      }

      const url = params.toString()
        ? `/api/events?${params.toString()}`
        : "/api/events";

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as EventsResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "failed_to_fetch_events");
      }

      setEvents(data.events ?? []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("イベント一覧の取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents(initialQuery);
  }, [initialQuery]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (trimmed) {
      router.push(`/events?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push("/events");
  }

  function handleClear() {
    setQuery("");
    router.push("/events");
  }

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
            条件に一致するイベントがありません。
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {event.title}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    event.applicationStatus === "open"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {applicationLabel(event.applicationStatus)}
                </span>
              </div>

              <p className="text-sm leading-6 text-neutral-600">
                {event.description}
              </p>

              <dl className="grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">日時</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-900">
                    {formatDate(event.eventDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-neutral-500">場所</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-900">
                    {event.place}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  詳細を見る
                </Link>

                <Link
                  href={`/events/${event.id}/apply`}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  参加する
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

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="タイトル・説明・場所で検索"
              className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                検索
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                クリア
              </button>
            </div>
          </form>
        </section>

        {content}
      </section>
    </main>
  );
}
