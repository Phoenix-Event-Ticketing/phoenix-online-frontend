import { PublicBookingClient } from "@/components/events/PublicBookingClient";

export default async function PublicBookingPage({
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

  return <PublicBookingClient eventId={safeEventId} />;
}

