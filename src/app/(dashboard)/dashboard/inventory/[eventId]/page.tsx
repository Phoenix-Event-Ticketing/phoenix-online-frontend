import { DashboardInventoryEventClient } from "@/components/events/DashboardInventoryEventClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function DashboardInventoryEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <DashboardInventoryEventClient eventId={eventId} />;
}

