"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardInventoryEventClient } from "@/components/events/DashboardInventoryEventClient";

export default function DashboardInventoryEventPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  if (!eventId) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Missing event ID.</p>
        <Link
          href="/dashboard/inventory"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
        >
          Back to inventory
        </Link>
      </div>
    );
  }

  return <DashboardInventoryEventClient eventId={eventId} />;
}
