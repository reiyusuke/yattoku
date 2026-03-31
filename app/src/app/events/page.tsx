import { Suspense } from "react";
import PageClient from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
  <section className="mx-auto max-w-5xl px-6 py-12 md:px-8">
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-600">読み込み中です...</p>
    </div>
  </section>
</main>
    }>
      <PageClient />
    </Suspense>
  );
}
