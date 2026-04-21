import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function DashboardEventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
