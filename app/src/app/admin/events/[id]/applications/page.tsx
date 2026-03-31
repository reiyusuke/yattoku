"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/components/admin-guard";

type ApplicationItem = {
  id: string;
  eventId: string;
  userId: string;
  inputName: string;
  status: string;
  appliedAt: string;
  user: {
    id: string;
    email: string;
    nickname: string | null;
    role: string;
    emailVerified: boolean;
  };
};

type AdminApplicationsResponse = {
  ok: boolean;
  event?: {
    id: string;
    title: string;
    publishStatus: string;
    applicationStatus: string;
  };
  applications?: ApplicationItem[];
  error?: string;
};

type PageProps = {
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

function statusLabel(status: string) {
  if (status === "applied") {
    return "申込済み";
  }

  if (status === "cancelled") {
    return "キャンセル";
  }

  return status;
}

export default function AdminEventApplicationsPage({ params }: PageProps) {
  const { user } = useAdminAuth();

  const [eventId, setEventId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
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
    if (!user || user.role !== "admin" || !eventId) {
      return;
    }

    let isMounted = true;

    async function loadApplications() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/admin/events/${eventId}/applications`, {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as AdminApplicationsResponse;

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "failed_to_fetch_applications");
        }

        if (isMounted) {
          setEventTitle(data.event?.title ?? "");
          setApplications(data.applications ?? []);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("参加者一覧の取得に失敗しました。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [eventId, user]);

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

    if (applications.length === 0) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">
            まだ参加申込はありません。
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                  名前
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                  メール
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                  状態
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                  申込日時
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-t border-neutral-200">
                  <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                    {application.inputName}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {application.user.email}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {statusLabel(application.status)}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {formatDate(application.appliedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [applications, error, isLoading]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:px-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/admin/events"
            className="w-fit text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← 管理イベント一覧へ戻る
          </Link>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-neutral-500">
              ADMIN APPLICATIONS
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              参加者一覧
            </h1>
            <p className="text-sm leading-6 text-neutral-600 md:text-base">
              {eventTitle
                ? `「${eventTitle}」の参加申込状況を確認できます。`
                : "イベントの参加申込状況を確認できます。"}
            </p>
          </div>
        </div>

        {content}
      </section>
    </main>
  );
}
