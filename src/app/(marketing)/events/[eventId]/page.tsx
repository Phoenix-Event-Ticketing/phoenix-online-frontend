import { PublicEventDetailsClient } from "@/components/events/PublicEventDetailsClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function PublicEventDetailsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <PublicEventDetailsClient eventId={eventId} />;
}

