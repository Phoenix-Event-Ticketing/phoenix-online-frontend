import { PublicBookingClient } from "@/components/events/PublicBookingClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function PublicBookingPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <PublicBookingClient eventId={eventId} />;
}

