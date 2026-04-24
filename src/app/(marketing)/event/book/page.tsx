import { Suspense } from "react";
import { PublicBookingQueryPageClient } from "@/components/events/PublicBookingQueryPageClient";

export default function PublicEventBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading booking...</p>
        </div>
      }
    >
      <PublicBookingQueryPageClient />
    </Suspense>
  );
}
