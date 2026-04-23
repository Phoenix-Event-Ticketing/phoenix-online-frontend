type EventIdRow = { eventId?: string };
import { mockEvents } from "@/lib/mock-events";

function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "http://localhost:8080";
}

export async function getEventStaticParams(): Promise<Array<{ eventId: string }>> {
  const fallback = mockEvents
    .map((event) => event.eventId?.trim())
    .filter((eventId): eventId is string => typeof eventId === "string" && eventId.length > 0)
    .map((eventId) => ({ eventId }));
  try {
    const response = await fetch(`${getPublicApiBaseUrl()}/events`, {
      cache: "no-store",
    });
    if (!response.ok) return fallback;
    const rows = (await response.json()) as EventIdRow[];
    const mapped = rows
      .map((item) => item?.eventId?.trim())
      .filter((eventId): eventId is string => typeof eventId === "string" && eventId.length > 0)
      .map((eventId) => ({ eventId }));
    return mapped.length ? mapped : fallback;
  } catch {
    return fallback;
  }
}
