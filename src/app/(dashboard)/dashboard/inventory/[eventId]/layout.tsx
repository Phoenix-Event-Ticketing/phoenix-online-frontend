import { mockEvents } from "@/lib/mock-events";

export const dynamicParams = false;

export function generateStaticParams() {
  return mockEvents.map((e) => ({ eventId: e.eventId }));
}

export default function DashboardInventoryEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
