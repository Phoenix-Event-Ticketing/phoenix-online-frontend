export default async function DashboardEventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Event details
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Event ID: <span className="font-mono">{eventId}</span>
      </p>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        This page is a placeholder. Next step is to fetch event details from the Event Service
        and show ticket summary (per the project outline).
      </p>
    </div>
  );
}

