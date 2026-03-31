import Link from "next/link";

export default function AdminHomePage() {
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
            <p className="text-sm font-medium text-neutral-500">ADMIN HOME</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              管理画面
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
              ヤットクMVPのイベント管理・参加者確認を行うための管理ページです。
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">EVENT MANAGEMENT</p>
                <h2 className="mt-2 text-2xl font-semibold">イベント一覧・作成</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  作成済みイベントの確認、新規イベント作成、公開状態や募集状態の管理を行えます。
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
                  各イベントの参加申込状況を確認し、誰が申し込んでいるかを一覧で確認できます。
                </p>
              </div>

              <div>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  イベント一覧から確認
                </Link>
              </div>
            </div>
          </article>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-neutral-500">MVP STATUS</p>
            <h2 className="text-2xl font-semibold">現在できること</h2>
            <ul className="grid gap-2 text-sm leading-6 text-neutral-700 md:grid-cols-2">
              <li>・イベント作成</li>
              <li>・イベント編集</li>
              <li>・公開状態の切り替え</li>
              <li>・募集状態の切り替え</li>
              <li>・参加者一覧の確認</li>
              <li>・admin 権限による管理画面保護</li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
