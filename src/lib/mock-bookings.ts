export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type BookingRecord = {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  customerName: string;
  customerEmail: string;
  ticketType: string;
  quantity: number;
  totalAmountLkr: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export const mockBookings: BookingRecord[] = [
  {
    bookingId: "book_501",
    eventId: "evt_101",
    eventTitle: "Phoenix Music Fest 2026",
    customerName: "Nimal Perera",
    customerEmail: "nimal@email.com",
    ticketType: "VIP",
    quantity: 2,
    totalAmountLkr: 24000,
    bookingStatus: "CONFIRMED",
    paymentStatus: "SUCCESS",
    createdAt: "2026-03-24T10:20:00Z",
  },
  {
    bookingId: "book_502",
    eventId: "evt_102",
    eventTitle: "Tech Talk: Cloud-Native Microservices",
    customerName: "Kasun Silva",
    customerEmail: "kasun@email.com",
    ticketType: "GENERAL",
    quantity: 1,
    totalAmountLkr: 4000,
    bookingStatus: "AWAITING_PAYMENT",
    paymentStatus: "PENDING",
    createdAt: "2026-03-25T07:15:00Z",
  },
  {
    bookingId: "book_503",
    eventId: "evt_101",
    eventTitle: "Phoenix Music Fest 2026",
    customerName: "Amali Fernando",
    customerEmail: "amali@email.com",
    ticketType: "STANDARD",
    quantity: 3,
    totalAmountLkr: 18000,
    bookingStatus: "FAILED",
    paymentStatus: "FAILED",
    createdAt: "2026-03-25T08:05:00Z",
  },
  {
    bookingId: "book_504",
    eventId: "evt_103",
    eventTitle: "Stand-up Night",
    customerName: "John Dias",
    customerEmail: "john@email.com",
    ticketType: "SEATED",
    quantity: 2,
    totalAmountLkr: 7000,
    bookingStatus: "CANCELLED",
    paymentStatus: "FAILED",
    createdAt: "2026-03-20T14:40:00Z",
  },
];

