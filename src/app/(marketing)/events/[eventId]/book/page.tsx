import { PublicBookingClient } from "@/components/events/PublicBookingClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

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

