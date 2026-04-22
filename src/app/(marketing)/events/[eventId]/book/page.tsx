import { PublicBookingClient } from "@/components/events/PublicBookingClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <PublicBookingClient eventId={eventId} />;
}

