"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/components/admin-guard";

type AdminEventItem = {
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

type AdminEventsResponse = {
  ok: boolean;
  events?: AdminEventItem[];
  error?: string;
};

type CreateEventResponse = {
  ok: boolean;
  event?: AdminEventItem;
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

function publishBadgeClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "draft":
      return "bg-amber-100 text-amber-700";
    case "private":
      return "bg-neutral-200 text-neutral-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

function applicationBadgeClass(status: string) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700";
    case "closed":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

function toDateTimeLocalValue(date = new Date()) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminEventsPage() {
  const { user } = useAdminAuth();

  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(
    toDateTimeLocalValue(new Date(Date.now() + 86400000))
  );
  const [place, setPlace] = useState("");
  const [publishStatus, setPublishStatus] = useState("draft");
  const [applicationStatus, setApplicationStatus] = useState("open");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  async function loadEvents() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/events", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminEventsResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "failed_to_fetch_admin_events");
      }

      setEvents(data.events ?? []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("管理イベント一覧の取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    loadEvents();
  }, [user]);

  async function handleCreateEvent(eventForm: FormEvent<HTMLFormElement>) {
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

      const response = await fetch("/api/admin/events", {
        method: "POST",
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

      const data = (await response.json()) as CreateEventResponse;

      if (!response.ok || !data.ok || !data.event) {
        switch (data.error) {
          case "title_required":
            throw new Error("タイトルを入力してください。");
          case "description_required":
            throw new Error("説明を入力してください。");
          case "place_required":
            throw new Error("場所を入力してください。");
          case "event_date_required":
            throw new Error("日時を入力してください。");
          case "invalid_event_date":
            throw new Error("日時の形式が不正です。");
          case "invalid_publish_status":
            throw new Error("公開状態が不正です。");
          case "invalid_application_status":
            throw new Error("募集状態が不正です。");
          default:
            throw new Error("イベント作成に失敗しました。");
        }
      }

      setTitle("");
      setDescription("");
      setEventDate(toDateTimeLocalValue(new Date(Date.now() + 86400000)));
      setPlace("");
      setPublishStatus("draft");
      setApplicationStatus("open");
      setSubmitSuccess("イベントを作成しました。");

      await loadEvents();
    } catch (submitFetchError) {
      console.error(submitFetchError);
      setSubmitError(
        submitFetchError instanceof Error
          ? submitFetchError.message
          : "イベント作成に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
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
            管理対象のイベントはまだありません。
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {event.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${publishBadgeClass(
                        event.publishStatus
                      )}`}
                    >
                      {publishLabel(event.publishStatus)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${applicationBadgeClass(
                        event.applicationStatus
                      )}`}
                    >
                      {applicationLabel(event.applicationStatus)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                    {event.description}
                  </p>
                </div>
              </div>

              <dl className="grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-3">
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

                <div>
                  <dt className="text-sm font-medium text-neutral-500">更新日時</dt>
                  <dd className="mt-1 text-sm font-medium text-neutral-900">
                    {formatDate(event.updatedAt)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  学生表示で確認
                </Link>

                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  編集
                </Link>

                <Link
                  href={`/admin/events/${event.id}/applications`}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  参加者一覧を見る
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
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← ホームへ戻る
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">ADMIN EVENTS</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                管理画面 / イベント一覧
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
                イベントの公開状態・募集状態・内容を管理するための一覧です。
              </p>
            </div>

            <div className="flex gap-3">
              <span className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                件数: {events.length}
              </span>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">CREATE EVENT</p>
              <h2 className="mt-2 text-2xl font-semibold">イベント作成</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                管理画面から新しいイベントを作成できます。
              </p>
            </div>

            <form className="grid gap-5" onSubmit={handleCreateEvent}>
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
                    placeholder="例: 新歓交流会"
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
                    placeholder="例: 大阪経済大学 A館101"
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
                  placeholder="イベントの内容を入力"
                  rows={4}
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

              <div className="flex">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                    isSubmitting
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  {isSubmitting ? "作成中..." : "イベントを作成する"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {content}
      </section>
    </main>
  );
}
