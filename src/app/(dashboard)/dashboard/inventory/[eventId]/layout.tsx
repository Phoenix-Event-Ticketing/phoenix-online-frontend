import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function DashboardInventoryEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
