import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getPersistedAccessToken } from "@/lib/auth-ui";
import type { EventSummary } from "@/lib/events";

export type UserRole = "USER" | "ORGANIZER" | "ADMIN";

export type ApiUser = {
  id: string;
  email: string;
  name?: string;
  roles?: UserRole[];
};

export type RegisterRequest = { email: string; password: string; name?: string };
export type LoginRequest = { email: string; password: string };
export type BatchUsersRequest = { user_ids: string[] };
export type UpdateUserRequest = { id: string; name: string };
export type UpdateRoleRequest = { id: string; role: UserRole };

type AuthResponse = {
  accessToken?: string;
  token?: string;
  access_token?: string;
  user?: ApiUser;
};
type BatchUsersResponse = { users?: ApiUser[] };

type EventPayload = {
  title?: string;
  description?: string;
  venue?: string;
  city?: string;
  eventDateTime?: string;
  organizerName?: string;
  category?: string;
  bannerUrl?: string;
  banner?: File | null;
};

export type EventRecord = EventSummary;
export type CreateEventRequest = Required<
  Pick<EventPayload, "title" | "venue" | "city" | "eventDateTime" | "organizerName" | "category">
> &
  Pick<EventPayload, "description" | "bannerUrl" | "banner">;
export type UpdateEventRequest = { eventId: string } & EventPayload;
export type EventApiError = FetchBaseQueryError & { data?: { message?: string } };
export type TicketType = "VIP" | "STANDARD" | "EARLY_BIRD";
export type InventoryRecord = {
  inventoryId: string;
  eventId: string;
  ticketType: TicketType;
  price: number;
  totalQuantity: number;
  heldQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  createdAt?: string;
  updatedAt?: string;
};
type InventoryEventResponse = { eventId: string; items: InventoryRecord[] };
export type CreateInventoryRequest = {
  eventId: string;
  ticketType: TicketType;
  price: number;
  totalQuantity: number;
};
export type CreateInventoryBulkRequest = {
  eventId: string;
  items: Array<{
    ticketType: TicketType;
    price: number;
    totalQuantity: number;
  }>;
};
export type UpdateInventoryRequest = {
  inventoryId: string;
  ticketType?: TicketType;
  price?: number;
  totalQuantity?: number;
};
export type HoldInventoryRequest = {
  eventId: string;
  ticketType: TicketType;
  quantity: number;
  bookingId: string;
};
export type HoldActionRequest = { bookingId: string };
export type HoldActionResponse = {
  bookingId: string;
  holdStatus: "HELD" | "CONFIRMED" | "RELEASED";
  expiresAt?: string;
};
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentRecord = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  userId?: string;
  transactionReference?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};
export type RefundRecord = {
  id: string;
  paymentId: string;
  refundAmount: number;
  refundReason: string;
  status: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};
type ServiceEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown> | null;
};
type ServiceErrorEnvelope = {
  success: false;
  error?: { message?: string; code?: string; details?: unknown };
};
export type ApiEnvelopeError = FetchBaseQueryError & {
  data?: ServiceErrorEnvelope;
};
export type CreatePaymentRequest = {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
};
export type UpdatePaymentStatusRequest = {
  id: string;
  status: PaymentStatus;
};
export type CreateRefundRequest = {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
};
export type UpdateRefundStatusRequest = {
  id: string;
  status: string;
};
export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";
export type BookingPaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type BookingRecord = {
  id?: string;
  bookingId: string;
  eventId: string;
  userId: string;
  customerEmail: string;
  seat: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  paymentReferenceId?: string;
  paymentTransactionId?: string;
  bookingStatus: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateBookingRequest = {
  eventId: string;
  customerEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  seat: string;
  userId: string;
};
export type UpdateBookingRequest = {
  bookingId: string;
  eventId?: string;
  customerEmail?: string;
  seat?: string;
  userId?: string;
  ticketType?: string;
  quantity?: number;
  totalAmount?: number;
};
export type StartPaymentResponse = {
  bookingId: string;
  paymentReferenceId: string;
  bookingStatus: BookingStatus;
  paymentStatus: BookingPaymentStatus;
};
export type PaymentCallbackRequest = {
  bookingId: string;
  paymentReferenceId: string;
  paymentStatus: BookingPaymentStatus;
  transactionId?: string;
};
export type ExpireBookingRequest = {
  bookingId: string;
  internalServiceId: string;
};
export type ProcessPaymentCallbackRequest = {
  internalServiceId: string;
  payload: PaymentCallbackRequest;
};

/** Backend origin (no trailing slash). Override via NEXT_PUBLIC_API_BASE_URL for production builds. */
function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "https://api-dev.phoenix-project.online";
}

function cleanValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next ? next : undefined;
}

function buildEventBody(
  input: EventPayload,
): { body: FormData | Record<string, string> } {
  const payload: Record<string, string> = {};
  const allowedFields = [
    "title",
    "description",
    "venue",
    "city",
    "eventDateTime",
    "organizerName",
    "category",
    "bannerUrl",
  ] as const;

  for (const key of allowedFields) {
    const value = cleanValue(input[key]);
    if (value) payload[key] = value;
  }

  if (input.banner instanceof File) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    formData.append("banner", input.banner);
    return { body: formData };
  }

  return { body: payload };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getPublicApiBaseUrl(),
  prepareHeaders: (headers) => {
    const token = getPersistedAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["Event", "Inventory", "Payment", "Refund", "Booking"],
  baseQuery: rawBaseQuery,
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/users/login", method: "POST", body }),
    }),
    signUp: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/users/register", method: "POST", body }),
    }),
    batchUsers: builder.mutation<ApiUser[], BatchUsersRequest>({
      query: (body) => ({ url: "/users/batch", method: "POST", body }),
      transformResponse: (response: BatchUsersResponse | ApiUser[]) =>
        Array.isArray(response) ? response : response.users ?? [],
    }),
    updateUser: builder.mutation<ApiUser, UpdateUserRequest>({
      query: ({ id, name }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "PUT",
        body: { name },
      }),
    }),
    updateUserRole: builder.mutation<ApiUser, UpdateRoleRequest>({
      query: ({ id, role }) => ({
        url: `/users/${encodeURIComponent(id)}/role`,
        method: "PUT",
        body: { role },
      }),
    }),
    listEvents: builder.query<EventRecord[], void>({
      query: () => ({ url: "/events" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((event) => ({ type: "Event" as const, id: event.eventId })),
              { type: "Event" as const, id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
    }),
    /** All statuses (DRAFT, PUBLISHED, CANCELLED); requires auth with event view permission. */
    listAllEvents: builder.query<EventRecord[], void>({
      query: () => ({ url: "/events/internal/events" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((event) => ({ type: "Event" as const, id: event.eventId })),
              { type: "Event" as const, id: "LIST" },
              { type: "Event" as const, id: "LIST_ALL" },
            ]
          : [{ type: "Event", id: "LIST" }, { type: "Event", id: "LIST_ALL" }],
    }),
    getEvent: builder.query<EventRecord, string>({
      query: (eventId) => ({ url: `/events/${encodeURIComponent(eventId)}` }),
      providesTags: (_result, _err, eventId) => [{ type: "Event", id: eventId }],
    }),
    createEvent: builder.mutation<EventRecord, CreateEventRequest>({
      query: (payload) => {
        const { body } = buildEventBody(payload);
        return { url: "/events", method: "POST", body };
      },
      invalidatesTags: [{ type: "Event", id: "LIST" }, { type: "Event", id: "LIST_ALL" }],
    }),
    updateEvent: builder.mutation<EventRecord, UpdateEventRequest>({
      query: ({ eventId, ...payload }) => {
        const { body } = buildEventBody(payload);
        return {
          url: `/events/${encodeURIComponent(eventId)}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: "Event", id: arg.eventId },
        { type: "Event", id: "LIST" },
        { type: "Event", id: "LIST_ALL" },
      ],
    }),
    publishEvent: builder.mutation<EventRecord, string>({
      query: (eventId) => ({
        url: `/events/${encodeURIComponent(eventId)}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _err, eventId) => [
        { type: "Event", id: eventId },
        { type: "Event", id: "LIST" },
        { type: "Event", id: "LIST_ALL" },
      ],
    }),
    cancelEvent: builder.mutation<EventRecord, string>({
      query: (eventId) => ({
        url: `/events/${encodeURIComponent(eventId)}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _err, eventId) => [
        { type: "Event", id: eventId },
        { type: "Event", id: "LIST" },
        { type: "Event", id: "LIST_ALL" },
      ],
    }),
    getEventInventory: builder.query<InventoryEventResponse, string>({
      query: (eventId) => ({ url: `/inventory/event/${encodeURIComponent(eventId)}` }),
      providesTags: (_result, _err, eventId) => [
        { type: "Inventory", id: `EVENT:${eventId}` },
      ],
    }),
    getEventInventoryAvailability: builder.query<InventoryEventResponse, string>({
      query: (eventId) => ({
        url: `/inventory/event/${encodeURIComponent(eventId)}/availability`,
      }),
      providesTags: (_result, _err, eventId) => [
        { type: "Inventory", id: `EVENT:${eventId}` },
      ],
    }),
    getInventoryById: builder.query<InventoryRecord, string>({
      query: (inventoryId) => ({ url: `/inventory/${encodeURIComponent(inventoryId)}` }),
      providesTags: (_result, _err, inventoryId) => [
        { type: "Inventory", id: inventoryId },
      ],
    }),
    createInventory: builder.mutation<InventoryRecord, CreateInventoryRequest>({
      query: (body) => ({ url: "/inventory", method: "POST", body }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Inventory", id: `EVENT:${arg.eventId}` },
      ],
    }),
    createInventoryBulk: builder.mutation<InventoryEventResponse, CreateInventoryBulkRequest>({
      query: (body) => ({ url: "/inventory/bulk", method: "POST", body }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Inventory", id: `EVENT:${arg.eventId}` },
      ],
    }),
    updateInventory: builder.mutation<InventoryRecord, UpdateInventoryRequest>({
      query: ({ inventoryId, ...body }) => ({
        url: `/inventory/${encodeURIComponent(inventoryId)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: "Inventory", id: arg.inventoryId }],
    }),
    holdInventory: builder.mutation<HoldActionResponse, HoldInventoryRequest>({
      query: (body) => ({ url: "/inventory/hold", method: "POST", body }),
    }),
    confirmInventoryHold: builder.mutation<HoldActionResponse, HoldActionRequest>({
      query: (body) => ({ url: "/inventory/confirm", method: "POST", body }),
    }),
    releaseInventoryHold: builder.mutation<HoldActionResponse, HoldActionRequest>({
      query: (body) => ({ url: "/inventory/release", method: "POST", body }),
    }),
    listPayments: builder.query<PaymentRecord[], { all?: boolean } | void>({
      query: (args) => ({
        url: "/payments",
        params: args?.all ? { all: true } : undefined,
      }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord[]>) =>
        response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((payment) => ({ type: "Payment" as const, id: payment.id })),
              { type: "Payment" as const, id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),
    getPaymentById: builder.query<PaymentRecord, string>({
      query: (id) => ({ url: `/payments/${encodeURIComponent(id)}` }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) => response.data,
      providesTags: (_result, _err, id) => [{ type: "Payment", id }],
    }),
    createPayment: builder.mutation<PaymentRecord, CreatePaymentRequest>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) => response.data,
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
    updatePaymentStatus: builder.mutation<PaymentRecord, UpdatePaymentStatusRequest>({
      query: ({ id, status }) => ({
        url: `/payments/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) => response.data,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Payment", id: arg.id },
        { type: "Payment", id: "LIST" },
      ],
    }),
    cancelPayment: builder.mutation<PaymentRecord, string>({
      query: (id) => ({ url: `/payments/${encodeURIComponent(id)}/cancel`, method: "PATCH" }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) => response.data,
      invalidatesTags: (_result, _err, id) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
      ],
    }),
    createRefund: builder.mutation<RefundRecord, CreateRefundRequest>({
      query: (body) => ({ url: "/refunds", method: "POST", body }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) => response.data,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Payment", id: arg.paymentId },
        { type: "Refund", id: "LIST" },
      ],
    }),
    updateRefundStatus: builder.mutation<RefundRecord, UpdateRefundStatusRequest>({
      query: ({ id, status }) => ({
        url: `/refunds/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) => response.data,
      invalidatesTags: (_result, _err, arg) => [{ type: "Refund", id: arg.id }],
    }),
    getRefundById: builder.query<RefundRecord, string>({
      query: (id) => ({ url: `/refunds/${encodeURIComponent(id)}` }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) => response.data,
      providesTags: (_result, _err, id) => [{ type: "Refund", id }],
    }),
    getRefundsByPaymentId: builder.query<RefundRecord[], string>({
      query: (paymentId) => ({
        url: `/refunds/payment/${encodeURIComponent(paymentId)}`,
      }),
      transformResponse: (response: ServiceEnvelope<RefundRecord[]>) => response.data ?? [],
      providesTags: (result, _err, paymentId) =>
        result
          ? [
              ...result.map((refund) => ({ type: "Refund" as const, id: refund.id })),
              { type: "Refund" as const, id: `PAYMENT:${paymentId}` },
            ]
          : [{ type: "Refund", id: `PAYMENT:${paymentId}` }],
    }),
    createBooking: builder.mutation<BookingRecord, CreateBookingRequest>({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      transformResponse: (response: BookingRecord) => response,
      invalidatesTags: [{ type: "Booking", id: "LIST" }],
    }),
    listBookings: builder.query<BookingRecord[], void>({
      query: () => ({ url: "/bookings" }),
      transformResponse: (response: BookingRecord[]) => response ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((booking) => ({
                type: "Booking" as const,
                id: booking.bookingId,
              })),
              { type: "Booking" as const, id: "LIST" },
            ]
          : [{ type: "Booking", id: "LIST" }],
    }),
    getBookingById: builder.query<BookingRecord, string>({
      query: (bookingId) => ({ url: `/bookings/${encodeURIComponent(bookingId)}` }),
      transformResponse: (response: BookingRecord) => response,
      providesTags: (_result, _err, bookingId) => [{ type: "Booking", id: bookingId }],
    }),
    updateBooking: builder.mutation<BookingRecord, UpdateBookingRequest>({
      query: ({ bookingId, ...body }) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: BookingRecord) => response,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Booking", id: arg.bookingId },
        { type: "Booking", id: "LIST" },
      ],
    }),
    cancelBooking: builder.mutation<BookingRecord, string>({
      query: (bookingId) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/cancel`,
        method: "PATCH",
      }),
      transformResponse: (response: BookingRecord) => response,
      invalidatesTags: (_result, _err, bookingId) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
      ],
    }),
    startBookingPayment: builder.mutation<StartPaymentResponse, string>({
      query: (bookingId) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/start-payment`,
        method: "POST",
      }),
      transformResponse: (response: StartPaymentResponse) => response,
      invalidatesTags: (_result, _err, bookingId) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
      ],
    }),
    getBookingsByCustomerEmail: builder.query<BookingRecord[], string>({
      query: (email) => ({ url: `/bookings/customer/${encodeURIComponent(email)}` }),
      transformResponse: (response: BookingRecord[]) => response ?? [],
    }),
    expireBooking: builder.mutation<BookingRecord, ExpireBookingRequest>({
      query: ({ bookingId, internalServiceId }) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/expire`,
        method: "POST",
        headers: { "X-Internal-Service-Id": internalServiceId },
      }),
      transformResponse: (response: BookingRecord) => response,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Booking", id: arg.bookingId },
        { type: "Booking", id: "LIST" },
      ],
    }),
    processPaymentCallback: builder.mutation<BookingRecord, ProcessPaymentCallbackRequest>({
      query: ({ internalServiceId, payload }) => ({
        url: "/bookings/payment-callback",
        method: "POST",
        headers: { "X-Internal-Service-Id": internalServiceId },
        body: payload,
      }),
      transformResponse: (response: BookingRecord) => response,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Booking", id: arg.payload.bookingId },
        { type: "Booking", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useBatchUsersMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useListEventsQuery,
  useListAllEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useGetEventInventoryQuery,
  useGetEventInventoryAvailabilityQuery,
  useGetInventoryByIdQuery,
  useCreateInventoryMutation,
  useCreateInventoryBulkMutation,
  useUpdateInventoryMutation,
  useHoldInventoryMutation,
  useConfirmInventoryHoldMutation,
  useReleaseInventoryHoldMutation,
  useListPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useCancelPaymentMutation,
  useCreateRefundMutation,
  useUpdateRefundStatusMutation,
  useGetRefundByIdQuery,
  useGetRefundsByPaymentIdQuery,
  useCreateBookingMutation,
  useListBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useStartBookingPaymentMutation,
  useGetBookingsByCustomerEmailQuery,
  useExpireBookingMutation,
  useProcessPaymentCallbackMutation,
} = api;
