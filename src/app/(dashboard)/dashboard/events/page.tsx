import { EventCard } from "@/components/events/EventCard";
import { mockEvents } from "@/lib/mock-events";

export default function DashboardEventsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Events
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Showing sample data for now. This will be wired to the Event Service API next.
            </p>
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {mockEvents.length} total
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {mockEvents.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            href={`/dashboard/events/${event.eventId}`}
            variant="list"
          />
        ))}
      </div>
    </div>
  );
}
