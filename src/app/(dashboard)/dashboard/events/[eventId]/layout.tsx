import { getEventStaticParams } from "@/lib/event-static-params";
import { RequireRole } from "@/components/dashboard/RequireRole";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function DashboardEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole tab="events">{children}</RequireRole>;
}
