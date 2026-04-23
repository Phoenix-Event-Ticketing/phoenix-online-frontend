import { PublicEventDetailsClient } from "@/components/events/PublicEventDetailsClient";
export default function PublicEventDetailsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <PublicEventDetailsClient eventId={eventId} />;
}

