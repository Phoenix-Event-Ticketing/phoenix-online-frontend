import { EventCard } from "@/components/events/EventCard";
import { mockEvents } from "@/lib/mock-events";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-16">
      <div className="rounded-xl bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Demo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Phoenix Events
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Browse upcoming events and reserve tickets. (API wiring comes next — showing sample
          data for now.)
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Upcoming events
          </h2>
        </div>

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
      </section>
    </div>
  );
}
