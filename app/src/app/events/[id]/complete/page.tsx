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

type CompletePageProps = {
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

export default function EventCompletePage({ params }: CompletePageProps) {
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          throw new Error(data.error ?? "failed_to_fetch_event");
        }

        if (isMounted) {
          setEvent(data.event);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("参加完了情報の取得に失敗しました。");
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
            参加完了情報を表示できません。
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
            参加申込が完了しました
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              申込完了
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-600 md:text-base">
              イベントへの参加申込が完了しました。開催日時と場所を確認して、当日に参加してください。
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">イベント名</p>
                <p className="mt-1 text-xl font-semibold text-neutral-900">
                  {event.title}
                </p>
              </div>

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
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              イベント一覧へ
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              ホームへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }, [error, event, isLoading]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-neutral-500">EVENT COMPLETE</p>
          <h2 className="text-2xl font-semibold md:text-3xl">参加完了</h2>
        </div>

        {content}
      </section>
    </main>
  );
}
