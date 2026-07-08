import { Suspense } from "react";

import PreviewPage from "./preview-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
          Loading preview...
        </main>
      }
    >
      <PreviewPage />
    </Suspense>
  );
}
