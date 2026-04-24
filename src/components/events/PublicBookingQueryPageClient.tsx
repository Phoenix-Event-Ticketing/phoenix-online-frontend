"use client";

import { useSearchParams } from "next/navigation";
import { PublicBookingClient } from "@/components/events/PublicBookingClient";

export function PublicBookingQueryPageClient() {
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

  return <PublicBookingClient eventId={safeEventId} />;
}
