import { RequireRole } from "@/components/dashboard/RequireRole";

export default function DashboardEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole tab="events">{children}</RequireRole>;
}
