import { formatLkr } from "@/lib/events";

export type TicketRate = {
  ticketType: string;
  priceLkr: number;
  availableTickets: number;
};

export const mockInventoryByEventId: Record<string, TicketRate[]> = {
  evt_101: [
    { ticketType: "VIP", priceLkr: 12000, availableTickets: 38 },
    { ticketType: "STANDARD", priceLkr: 6000, availableTickets: 210 },
    { ticketType: "EARLY_BIRD", priceLkr: 4000, availableTickets: 0 },
  ],
  evt_102: [
    { ticketType: "GENERAL", priceLkr: 4000, availableTickets: 120 },
    { ticketType: "STUDENT", priceLkr: 2500, availableTickets: 45 },
  ],
  evt_103: [
    { ticketType: "STANDING", priceLkr: 2500, availableTickets: 0 },
    { ticketType: "SEATED", priceLkr: 3500, availableTickets: 0 },
  ],
};

export function cheapestRateLkr(rates: TicketRate[] | undefined) {
  if (!rates?.length) return undefined;
  const cheapest = rates
    .filter((r) => typeof r.priceLkr === "number" && !Number.isNaN(r.priceLkr))
    .sort((a, b) => a.priceLkr - b.priceLkr)[0];
  return cheapest?.priceLkr;
}

export function formatRateLine(r: TicketRate) {
  return `${r.ticketType} • ${formatLkr(r.priceLkr) ?? `${r.priceLkr} LKR`}`;
}

