import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:px-8">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit rounded-full border border-neutral-200 px-4 py-1 text-sm text-neutral-600">
            ヤットク MVP
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              めんどい段取り、
              <br />
              全部ヤットクから。
            </h1>

            <p className="max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              ヤットクは、大学内イベントを簡単に見つけて参加できるサービスです。
              運営が作成したイベントを確認し、内容・日時・場所を見て、そのまま参加申込できます。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              イベントを見る
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              ログイン
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              新規登録
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-500">イベントを見る</p>
            <h2 className="mt-2 text-xl font-semibold">一覧で探せる</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              開催予定のイベントを一覧で確認できます。
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-500">内容を確認</p>
            <h2 className="mt-2 text-xl font-semibold">詳細がわかる</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              内容・日時・場所を見て、参加するか判断できます。
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-500">すぐ参加</p>
            <h2 className="mt-2 text-xl font-semibold">申込が簡単</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              MVPでは最小入力で、イベント参加申込まで進めます。
            </p>
          </div>
        </div>

        <section
          id="about"
          className="rounded-3xl bg-neutral-50 p-6 md:p-8"
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">ヤットクとは</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-700 md:text-base">
              ヤットクは、大学メールアドレスを持つ学生が、学内イベントに安心して参加できることを目指すサービスです。
              MVPでは、投稿機能や決済機能は持たせず、イベント一覧表示・詳細確認・参加申込という最小導線に集中しています。
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">GET STARTED</p>
              <h2 className="mt-2 text-2xl font-semibold">まずはイベントを見てみる</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600 md:text-base">
                気になるイベントがあれば、ログインしてそのまま参加申込できます。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                イベント一覧へ
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                新規登録する
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
