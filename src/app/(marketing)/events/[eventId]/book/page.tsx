import { PublicBookingClient } from "@/components/events/PublicBookingClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default function PublicBookingPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <PublicBookingClient eventId={eventId} />;
}

