"use client";

import { useSearchParams } from "next/navigation";
import { PublicEventDetailsClient } from "@/components/events/PublicEventDetailsClient";

export function PublicEventQueryPageClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";
  const safeEventId = (() => {
    const raw = typeof eventId === "string" ? eventId : "";
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  })();

  return <PublicEventDetailsClient eventId={safeEventId} />;
}
