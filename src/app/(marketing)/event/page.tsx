import { Suspense } from "react";
import { PublicEventQueryPageClient } from "@/components/events/PublicEventQueryPageClient";

export default function PublicEventPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading event...</p>
        </div>
      }
    >
      <PublicEventQueryPageClient />
    </Suspense>
  );
}
