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
  const rawEventId = typeof params?.eventId === "string" ? params.eventId : "";
  const safeEventId = (() => {
    try {
      return decodeURIComponent(rawEventId).trim();
    } catch {
      return rawEventId.trim();
    }
  })();

  return <DashboardInventoryEventClient eventId={safeEventId} />;
}

