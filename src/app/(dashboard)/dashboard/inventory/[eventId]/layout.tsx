import { RequireRole } from "@/components/dashboard/RequireRole";

export default function DashboardInventoryEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole tab="inventory">{children}</RequireRole>;
}
