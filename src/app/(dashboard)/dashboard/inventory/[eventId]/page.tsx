import { DashboardInventoryEventClient } from "@/components/events/DashboardInventoryEventClient";

export default async function DashboardInventoryEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const rawEventId = typeof eventId === "string" ? eventId : "";
  const safeEventId = (() => {
    try {
      return decodeURIComponent(rawEventId).trim();
    } catch {
      return rawEventId.trim();
    }
  })();

  return <DashboardInventoryEventClient eventId={safeEventId} />;
}

