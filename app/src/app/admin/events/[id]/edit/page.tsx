"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin-guard";

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

type EventsListResponse = {
  ok: boolean;
  events?: EventDetail[];
  error?: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function toDateTimeLocalValue(dateString: string) {
  const date = new Date(dateString);
  const pad = (value: number) => value.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminEventEditPage({ params }: PageProps) {
  const { user } = useAdminAuth();
  const router = useRouter();

  const [eventId, setEventId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [place, setPlace] = useState("");
  const [publishStatus, setPublishStatus] = useState("draft");
  const [applicationStatus, setApplicationStatus] = useState("open");

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
    if (!user || user.role !== "admin" || !eventId) {
      return;
    }

    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/admin/events", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as EventsListResponse;

        if (!response.ok || !data.ok || !data.events) {
          throw new Error(data.error ?? "failed_to_fetch_events");
        }

        const target = data.events.find((event) => event.id === eventId);

        if (!target) {
          throw new Error("event_not_found");
        }

        if (!isMounted) {
          return;
        }

        setTitle(target.title);
        setDescription(target.description);
        setEventDate(toDateTimeLocalValue(target.eventDate));
        setPlace(target.place);
        setPublishStatus(target.publishStatus);
        setApplicationStatus(target.applicationStatus);
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("イベント情報の取得に失敗しました。");
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
  }, [eventId, user]);

  async function handleSubmit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPlace = place.trim();

    if (!trimmedTitle) {
      setSubmitError("タイトルを入力してください。");
      return;
    }

    if (!trimmedDescription) {
      setSubmitError("説明を入力してください。");
      return;
    }

    if (!trimmedPlace) {
      setSubmitError("場所を入力してください。");
      return;
    }

    if (!eventDate) {
      setSubmitError("日時を入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          eventDate: new Date(eventDate).toISOString(),
          place: trimmedPlace,
          publishStatus,
          applicationStatus,
        }),
      });

      const data = (await response.json()) as EventDetailResponse;

      if (!response.ok || !data.ok) {
        switch (data.error) {
          case "title_required":
            throw new Error("タイトルを入力してください。");
          case "description_required":
            throw new Error("説明を入力してください。");
          case "place_required":
            throw new Error("場所を入力してください。");
          case "event_date_required":
          case "invalid_event_date":
            throw new Error("日時が不正です。");
          case "invalid_publish_status":
            throw new Error("公開状態が不正です。");
          case "invalid_application_status":
            throw new Error("募集状態が不正です。");
          case "event_not_found":
            throw new Error("イベントが見つかりません。");
          default:
            throw new Error("イベント更新に失敗しました。");
        }
      }

      setSubmitSuccess("イベントを更新しました。");
      setTimeout(() => {
        router.push("/admin/events");
      }, 800);
    } catch (submitFetchError) {
      console.error(submitFetchError);
      setSubmitError(
        submitFetchError instanceof Error
          ? submitFetchError.message
          : "イベント更新に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <section className="mx-auto max-w-4xl px-6 py-12 md:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-600">読み込み中です...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <section className="mx-auto max-w-4xl px-6 py-12 md:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/admin/events"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← 管理イベント一覧へ戻る
          </Link>

          <div>
            <p className="text-sm font-medium text-neutral-500">EDIT EVENT</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              イベント編集
            </h1>
          </div>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-sm font-medium text-neutral-700">
                  タイトル
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                  maxLength={200}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="place" className="text-sm font-medium text-neutral-700">
                  場所
                </label>
                <input
                  id="place"
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-neutral-700"
              >
                説明
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                maxLength={2000}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="eventDate"
                  className="text-sm font-medium text-neutral-700"
                >
                  日時
                </label>
                <input
                  id="eventDate"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="publishStatus"
                  className="text-sm font-medium text-neutral-700"
                >
                  公開状態
                </label>
                <select
                  id="publishStatus"
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                >
                  <option value="draft">下書き</option>
                  <option value="published">公開中</option>
                  <option value="private">非公開</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="applicationStatus"
                  className="text-sm font-medium text-neutral-700"
                >
                  募集状態
                </label>
                <select
                  id="applicationStatus"
                  value={applicationStatus}
                  onChange={(e) => setApplicationStatus(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                >
                  <option value="open">募集中</option>
                  <option value="closed">募集終了</option>
                </select>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            ) : null}

            {submitSuccess ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">{submitSuccess}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                  isSubmitting
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                {isSubmitting ? "更新中..." : "イベントを更新する"}
              </button>

              <Link
                href="/admin/events"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                戻る
              </Link>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
