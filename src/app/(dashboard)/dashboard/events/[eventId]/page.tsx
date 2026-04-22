import { DashboardEventDetailsClient } from "@/components/events/DashboardEventDetailsClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default async function DashboardEventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <DashboardEventDetailsClient eventId={eventId} />;
}

