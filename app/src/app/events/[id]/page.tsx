"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type EventDetailPageProps = {
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

function applicationLabel(applicationStatus: string) {
  if (applicationStatus === "open") {
    return "募集中";
  }

  if (applicationStatus === "closed") {
    return "募集終了";
  }

  return applicationStatus;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [eventId, setEventId] = useState<string>("");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

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
              : "イベント詳細の取得に失敗しました。";

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
  }, [eventId]);

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
      <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
              {applicationLabel(event.applicationStatus)}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700 md:text-base">
              {event.description}
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl bg-neutral-50 p-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-500">日時</p>
              <p className="mt-2 text-base font-medium text-neutral-900">
                {formatDate(event.eventDate)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">場所</p>
              <p className="mt-2 text-base font-medium text-neutral-900">
                {event.place}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/events/${event.id}/apply`}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                event.applicationStatus === "open"
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-500 pointer-events-none"
              }`}
            >
              {event.applicationStatus === "open" ? "参加する" : "募集終了"}
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              一覧へ戻る
            </Link>
          </div>
        </div>
      </article>
    );
  }, [error, event, isLoading]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/events"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← イベント一覧へ戻る
          </Link>

          <div>
            <p className="text-sm font-medium text-neutral-500">EVENT DETAIL</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              イベント詳細
            </h2>
          </div>
        </div>

        {content}
      </section>
    </main>
  );
}
