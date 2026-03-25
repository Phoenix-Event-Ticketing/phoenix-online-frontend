import type { EventSummary } from "@/lib/events";

const DEFAULT_BANNER_URL =
  "https://res.cloudinary.com/dahaesn2j/image/upload/v1774050387/event-banners/kttjfdyskcge12u5vbxi.webp";

export const mockEvents: EventSummary[] = [
  {
    eventId: "evt_101",
    title: "Phoenix Music Fest 2026",
    description: "Live outdoor music festival",
    venue: "Colombo Grounds",
    city: "Colombo",
    eventDateTime: "2026-05-10T18:00:00Z",
    organizerName: "Phoenix Org",
    category: "Music",
    bannerUrl: DEFAULT_BANNER_URL,
    startingPriceLkr: 2000,
    status: "PUBLISHED",
  },
  {
    eventId: "evt_102",
    title: "Tech Talk: Cloud-Native Microservices",
    description: "A practical session on building and deploying microservices.",
    venue: "Auditorium",
    city: "Kandy",
    eventDateTime: "2026-04-12T09:30:00Z",
    organizerName: "CTSE Community",
    category: "Tech",
    bannerUrl: DEFAULT_BANNER_URL,
    startingPriceLkr: 4000,
    status: "DRAFT",
  },
  {
    eventId: "evt_103",
    title: "Stand-up Night",
    description: "Comedy night with multiple performers.",
    venue: "Main Hall",
    city: "Galle",
    eventDateTime: "2026-03-28T19:00:00Z",
    organizerName: "Laugh Lounge",
    category: "Comedy",
    bannerUrl: DEFAULT_BANNER_URL,
    startingPriceLkr: 2500,
    status: "CANCELLED",
  },
];

