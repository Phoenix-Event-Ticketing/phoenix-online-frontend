"use client";

import { EventCard } from "@/components/events/EventCard";
import { useListEventsQuery } from "@/store/api";

export default function EventsPage() {
  const { data: events = [], isLoading, isError } = useListEventsQuery();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Events
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Explore upcoming events.
        </p>
      </header>
      {isLoading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading events...</p>
      ) : null}
      {isError ? <p className="text-sm text-red-600">Failed to load events.</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            href={`/event?eventId=${encodeURIComponent(event.eventId)}`}
            variant="home"
            showStatus={false}
          />
        ))}
      </div>
    </div>
  );
}

