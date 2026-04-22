import { PublicEventDetailsClient } from "@/components/events/PublicEventDetailsClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default async function PublicEventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <PublicEventDetailsClient eventId={eventId} />;
}

