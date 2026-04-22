"use client";

import Link from "next/link";
import { eventBannerSrc, formatEventDateTime, formatLkr } from "@/lib/events";
import { useGetEventQuery, useGetEventInventoryAvailabilityQuery } from "@/store/api";

export function PublicEventDetailsClient({ eventId }: { eventId: string }) {
  const { data: event, isLoading, isError } = useGetEventQuery(eventId, {
    skip: !eventId,
  });
  const { data: inventory } = useGetEventInventoryAvailabilityQuery(eventId, {
    skip: !eventId,
  });
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading event...</p>
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Event not found.</p>
        <Link href="/events" className="mt-3 inline-block text-sm font-medium underline">
          Back to events
        </Link>
      </div>
    );
  }

  const location = [event.venue, event.city].filter(Boolean).join(", ");
  const rates = inventory?.items ?? [];

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-linear-to-b from-zinc-950 to-zinc-900 text-white dark:border-zinc-800">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <nav className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            <span className="px-1">›</span>
            <Link href="/events" className="hover:text-white">
              Events
            </Link>{" "}
            <span className="px-1">›</span>
            <span className="text-white/90">{event.title}</span>
          </nav>

          <div className="mt-6 min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
              <span>{formatEventDateTime(event.eventDateTime)}</span>
              <span className="text-white/40">•</span>
              <span>{location || "—"}</span>
              {event.organizerName ? (
                <>
                  <span className="text-white/40">•</span>
                  <span>{event.organizerName}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_360px] md:items-start">
          <div className="space-y-6">
            {event.description ? (
              <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  More information
                </h2>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {event.description}
                </p>
              </section>
            ) : null}

            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Ticket availability
                </h2>
                {formatLkr(event.startingPriceLkr) ? (
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    From {formatLkr(event.startingPriceLkr)}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="grid grid-cols-3 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
                  <p>Type</p>
                  <p className="text-right">Available</p>
                  <p className="text-right">Price</p>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {rates.length ? (
                    rates.map((r) => (
                      <div
                        key={r.ticketType}
                        className="grid grid-cols-3 items-center px-4 py-3 text-sm"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {r.ticketType}
                        </p>
                        <p className="text-right text-zinc-700 dark:text-zinc-300">
                          {r.availableQuantity}
                        </p>
                        <p className="text-right font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatLkr(r.price) ?? `${r.price} LKR`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      No ticket rates available yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="md:sticky md:top-20">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="relative aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={eventBannerSrc(event)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3 p-4">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Rates
                </p>

                <div className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                  {rates.length ? (
                    rates.map((r) => (
                      <div
                        key={r.ticketType}
                        className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm dark:bg-zinc-950"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                            {r.ticketType}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {r.availableQuantity > 0
                              ? `${r.availableQuantity} available`
                              : "Sold out"}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatLkr(r.price) ?? `${r.price} LKR`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white px-3 py-3 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                      No ticket rates available yet.
                    </div>
                  )}
                </div>

                <Link
                  href={`/events/${event.eventId}/book`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
