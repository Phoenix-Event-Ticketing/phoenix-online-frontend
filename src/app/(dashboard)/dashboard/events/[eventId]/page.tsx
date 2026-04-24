import { DashboardEventDetailsClient } from "@/components/events/DashboardEventDetailsClient";

export default async function DashboardEventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const safeEventId = (() => {
    try {
      return decodeURIComponent(eventId).trim();
    } catch {
      return eventId.trim();
    }
  })();

  return <DashboardEventDetailsClient eventId={safeEventId} />;
}

