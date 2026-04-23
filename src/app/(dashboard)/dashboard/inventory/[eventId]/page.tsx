import { DashboardInventoryEventClient } from "@/components/events/DashboardInventoryEventClient";

export default function DashboardInventoryEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  return <DashboardInventoryEventClient eventId={eventId} />;
}

