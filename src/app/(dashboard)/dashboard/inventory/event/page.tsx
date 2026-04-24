import { Suspense } from "react";
import { DashboardInventoryQueryPageClient } from "@/components/events/DashboardInventoryQueryPageClient";

export default function DashboardInventoryEventPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading inventory...</p>
        </div>
      }
    >
      <DashboardInventoryQueryPageClient />
    </Suspense>
  );
}
