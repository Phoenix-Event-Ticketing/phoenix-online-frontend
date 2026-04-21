import { getEventStaticParams } from "@/lib/event-static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getEventStaticParams();
}

export default function EventSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
