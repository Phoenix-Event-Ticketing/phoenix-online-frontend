import { EventCard } from "@/components/events/EventCard";
import { mockEvents } from "@/lib/mock-events";

export default function EventsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Events
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Explore upcoming events. (Sample data for now.)
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            href={`/events/${event.eventId}`}
            variant="home"
            showStatus={false}
          />
        ))}
      </div>
    </div>
  );
}

