import { DashboardEventDetailsClient } from "@/components/events/DashboardEventDetailsClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function DashboardEventDetailsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <DashboardEventDetailsClient eventId={eventId} />;
}

