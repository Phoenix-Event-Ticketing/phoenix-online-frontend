"use client";

import Link from "next/link";
import { formatEventDateTime } from "@/lib/events";
import {
  useGetEventInventoryAvailabilityQuery,
  useListEventsQuery,
} from "@/store/api";

function InventoryStats({ eventId }: { eventId: string }) {
  const { data } = useGetEventInventoryAvailabilityQuery(eventId);
  const items = data?.items ?? [];
  const ticketTypes = items.length;
  const totalAvailable = items.reduce((sum, row) => sum + row.availableQuantity, 0);

  return (
    <>
      <p className="col-span-1 text-right text-sm text-zinc-900 dark:text-zinc-50">
        {ticketTypes}
      </p>
      <p className="col-span-1 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {totalAvailable}
      </p>
    </>
  );
}

export default function DashboardInventoryPage() {
  const { data: events = [], isLoading, isError } = useListEventsQuery();
  const rows = events.map((event) => {
    const location = [event.venue, event.city].filter(Boolean).join(", ");
    return { event, location };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Inventory
            </h2>
            {isLoading ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Loading events...</p>
            ) : null}
            {isError ? <p className="mt-1 text-sm text-red-600">Failed to load events.</p> : null}
          </div>
          <Link
            href="/dashboard/inventory/add"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Add inventory
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
          <p className="col-span-4">Event</p>
          <p className="col-span-2">Date</p>
          <p className="col-span-2">Location</p>
          <p className="col-span-1 text-right">Types</p>
          <p className="col-span-1 text-right">Available</p>
          <p className="col-span-2 text-right">Action</p>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map(({ event, location }) => (
            <div key={event.eventId} className="grid grid-cols-12 items-center px-4 py-3">
              <div className="col-span-4 min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {event.title}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {event.eventId}
                </p>
              </div>
              <p className="col-span-2 text-sm text-zinc-700 dark:text-zinc-300">
                {formatEventDateTime(event.eventDateTime)}
              </p>
              <p className="col-span-2 truncate text-sm text-zinc-700 dark:text-zinc-300">
                {location || "—"}
              </p>
              <InventoryStats eventId={event.eventId} />
              <div className="col-span-2 flex justify-end">
                <Link
                  href={`/dashboard/inventory/${encodeURIComponent(event.eventId)}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                >
                  View inventory
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

