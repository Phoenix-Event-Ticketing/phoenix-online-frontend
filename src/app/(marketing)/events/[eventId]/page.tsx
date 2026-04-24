import { PublicEventDetailsClient } from "@/components/events/PublicEventDetailsClient";

export default async function PublicEventDetailsPage({
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

  return <PublicEventDetailsClient eventId={safeEventId} />;
}

