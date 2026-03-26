export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type EventSummary = {
  eventId: string;
  title: string;
  description?: string;
  venue?: string;
  city?: string;
  eventDateTime?: string; // ISO string
  organizerName?: string;
  category?: string;
  bannerUrl?: string;
  startingPriceLkr?: number;
  status: EventStatus;
};

export function formatEventDateTime(iso?: string) {
  if (!iso) return "Date TBD";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatLkr(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return undefined;
  return `${new Intl.NumberFormat(undefined).format(amount)} LKR`;
}

