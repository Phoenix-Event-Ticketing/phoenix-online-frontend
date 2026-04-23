import { DashboardInventoryEventClient } from "@/components/events/DashboardInventoryEventClient";
import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

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

