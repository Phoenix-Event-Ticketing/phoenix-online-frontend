"use client";

import { formatEventDateTime } from "@/lib/events";
import { useGetEventQuery } from "@/store/api";

export function DashboardEventDetailsClient({ eventId }: { eventId: string }) {
  const { data: event, isLoading, isError } = useGetEventQuery(eventId, {
    skip: !eventId,
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Event details
      </h2>
      {isLoading ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Loading event details...</p>
      ) : null}
      {isError || !event ? (
        <p className="mt-3 text-sm text-red-600">Could not load event details.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Event ID</dt>
            <dd className="font-mono text-zinc-900 dark:text-zinc-50">{event.eventId}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">{event.status}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Title</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">{event.title}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Date & time</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">
              {formatEventDateTime(event.eventDateTime)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Venue</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">{event.venue ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">City</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">{event.city ?? "—"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
