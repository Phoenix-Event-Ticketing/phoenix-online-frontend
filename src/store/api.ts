import {
  type BaseQueryFn,
  createApi,
  fetchBaseQuery,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import { getPersistedAccessToken } from "@/lib/auth-ui";
import type { EventStatus, EventSummary } from "@/lib/events";

export type UserRole = "USER" | "ORGANIZER" | "ADMIN";

export type ApiUser = {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  roles?: UserRole[];
  status?: "ACTIVE" | "INACTIVE";
};

export type RegisterRequest = { email: string; password: string; name?: string };
export type LoginRequest = { email: string; password: string };
export type BatchUsersRequest = { user_ids: string[] };
export type UpdateUserRequest = { id: string; name: string };
export type UpdateRoleRequest = { id: string; role: UserRole };
export type ListUsersRequest = {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: UserRole;
};
export type ListUsersResponse = {
  items: ApiUser[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type AuthResponse = {
  accessToken?: string;
  token?: string;
  access_token?: string;
  user?: ApiUser;
};
type BatchUsersResponse = { users?: ApiUser[] };

function normalizeAuthResponse(input: AuthResponse): AuthResponse {
  if (!input.user) return input;
  return {
    ...input,
    user: normalizeApiUser(input.user as ApiUser & { role?: UserRole }),
  };
}

function normalizeApiUser(input: ApiUser & { role?: UserRole }): ApiUser {
  const roleFromArray = input.roles?.[0];
  const resolvedRole = input.role ?? roleFromArray;
  return {
    ...input,
    role: resolvedRole,
    roles: resolvedRole ? [resolvedRole] : input.roles,
    status: input.status ?? "ACTIVE",
  };
}

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
  paymentId: string;
  id?: string;
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
  refundId: string;
  id?: string;
  paymentId: string;
  refundAmount: number;
  refundReason: string;
  refundStatus: string;
  status?: string;
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
  paymentMethod?: "CARD" | "BANK_TRANSFER" | "WALLET";
};
export type CompletePaymentRequest = {
  id: string;
  status: "SUCCESS" | "FAILED";
  paymentMethod?: "CARD" | "BANK_TRANSFER" | "WALLET";
};
export type CreateRefundRequest = {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
};
export type UpdateRefundStatusRequest = {
  refundId: string;
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

function normalizePaymentRecord(input: Partial<PaymentRecord> & Record<string, unknown>): PaymentRecord {
  return {
    paymentId: String(input.paymentId ?? input.id ?? ""),
    id: input.id ? String(input.id) : undefined,
    bookingId: String(input.bookingId ?? ""),
    amount: Number(input.amount ?? 0),
    currency: String(input.currency ?? "LKR"),
    paymentMethod: String(input.paymentMethod ?? "CARD"),
    status: (input.status as PaymentStatus) ?? "PENDING",
    userId: typeof input.userId === "string" ? input.userId : undefined,
    transactionReference:
      typeof input.transactionReference === "string" ? input.transactionReference : undefined,
    metadata:
      typeof input.metadata === "object" && input.metadata !== null
        ? (input.metadata as Record<string, unknown>)
        : undefined,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : undefined,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : undefined,
  };
}

function normalizeRefundRecord(input: Partial<RefundRecord> & Record<string, unknown>): RefundRecord {
  return {
    refundId: String(input.refundId ?? input.id ?? ""),
    id: input.id ? String(input.id) : undefined,
    paymentId: String(input.paymentId ?? ""),
    refundAmount: Number(input.refundAmount ?? 0),
    refundReason: String(input.refundReason ?? ""),
    refundStatus: String(input.refundStatus ?? input.status ?? "REQUESTED"),
    status: typeof input.status === "string" ? input.status : undefined,
    userId: typeof input.userId === "string" ? input.userId : undefined,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : undefined,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : undefined,
  };
}

function toApiOriginFromFrontend(origin: string): string {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === "dev.phoenix-project.online") {
      return `${url.protocol}//api-dev.phoenix-project.online`;
    }
    if (host === "phoenix-project.online") {
      return `${url.protocol}//api.phoenix-project.online`;
    }
  } catch {
    // Fall through to the original value when parsing fails.
  }
  return origin;
}

/** Backend origin (no trailing slash). Override via NEXT_PUBLIC_API_BASE_URL for production builds. */
function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return toApiOriginFromFrontend(raw).replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    return toApiOriginFromFrontend(window.location.origin).replace(/\/+$/, "");
  }

  return "http://localhost:8080";
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

type ProtectedRouteRule = {
  method: string;
  testPath: (path: string) => boolean;
};

const protectedRouteRules: ProtectedRouteRule[] = [
  // User management APIs are protected (except login/register).
  { method: "POST", testPath: (path) => path === "/users/batch" },
  { method: "PUT", testPath: (path) => /^\/users\/[^/]+$/.test(path) },
  { method: "PUT", testPath: (path) => /^\/users\/[^/]+\/role$/.test(path) },
  // Event write endpoints are protected.
  { method: "POST", testPath: (path) => path === "/events" },
  { method: "PUT", testPath: (path) => /^\/events\/[^/]+$/.test(path) },
  { method: "GET", testPath: (path) => path === "/events/internal/events" },
  { method: "PATCH", testPath: (path) => /^\/events\/[^/]+\/publish$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/events\/[^/]+\/cancel$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/events\/[^/]+\/status$/.test(path) },
  // Inventory mutation/admin APIs are protected.
  { method: "GET", testPath: (path) => /^\/inventory\/[^/]+$/.test(path) },
  { method: "POST", testPath: (path) => path === "/inventory" || path === "/inventory/bulk" },
  { method: "PUT", testPath: (path) => /^\/inventory\/[^/]+$/.test(path) },
  { method: "POST", testPath: (path) => path === "/inventory/hold" },
  { method: "POST", testPath: (path) => path === "/inventory/confirm" },
  { method: "POST", testPath: (path) => path === "/inventory/release" },
  // Booking APIs are protected for frontend users.
  { method: "POST", testPath: (path) => path === "/bookings" },
  { method: "GET", testPath: (path) => path === "/bookings" },
  { method: "GET", testPath: (path) => /^\/bookings\/customer\/[^/]+$/.test(path) },
  { method: "GET", testPath: (path) => /^\/bookings\/[^/]+$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/bookings\/[^/]+$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/bookings\/[^/]+\/cancel$/.test(path) },
  { method: "POST", testPath: (path) => /^\/bookings\/[^/]+\/start-payment$/.test(path) },
  // Payment/refund APIs are protected.
  { method: "GET", testPath: (path) => path === "/payments" || /^\/payments\/[^/]+$/.test(path) },
  { method: "POST", testPath: (path) => path === "/payments" },
  { method: "POST", testPath: (path) => /^\/payments\/[^/]+\/complete$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/payments\/[^/]+\/status$/.test(path) },
  { method: "PATCH", testPath: (path) => /^\/payments\/[^/]+\/cancel$/.test(path) },
  { method: "POST", testPath: (path) => path === "/refunds" },
  { method: "PATCH", testPath: (path) => /^\/refunds\/[^/]+\/status$/.test(path) },
  { method: "GET", testPath: (path) => /^\/refunds\/[^/]+$/.test(path) },
  { method: "GET", testPath: (path) => /^\/refunds\/payment\/[^/]+$/.test(path) },
];

function normalizePath(url: string): string {
  const pathOnly = url.split("?")[0]?.trim() ?? "";
  if (!pathOnly) return "/";
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
}

function shouldRequireAuth(arg: string | FetchArgs): boolean {
  const url = typeof arg === "string" ? arg : arg.url;
  const method = (typeof arg === "string" ? "GET" : arg.method ?? "GET").toUpperCase();
  const path = normalizePath(url);
  return protectedRouteRules.some((rule) => rule.method === method && rule.testPath(path));
}

function redirectToSignIn(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("auth") === "signin") return;
  url.searchParams.set("auth", "signin");
  window.location.assign(url.toString());
}

const unauthorizedError = {
  status: 401 as const,
  data: {
    success: false as const,
    error: {
      code: "AUTH_REQUIRED",
      message: "Authentication is required",
    },
  },
};

const baseQueryWithAuthGuard: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta> = async (
  arg,
  api,
  extraOptions,
) => {
  const requiresAuth = shouldRequireAuth(arg);
  const token = getPersistedAccessToken();

  if (requiresAuth && !token) {
    redirectToSignIn();
    return { error: unauthorizedError };
  }

  const result = await rawBaseQuery(arg, api, extraOptions);
  const status = "error" in result ? result.error?.status : undefined;
  // 401 means unauthenticated/session invalid; 403 means authenticated but unauthorized.
  // Redirecting on 403 traps users in a sign-in loop when they lack a permission.
  if (requiresAuth && status === 401) {
    redirectToSignIn();
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["Event", "Inventory", "Payment", "Refund", "Booking", "User"],
  baseQuery: baseQueryWithAuthGuard,
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/users/login", method: "POST", body }),
      transformResponse: (response: AuthResponse) => normalizeAuthResponse(response),
    }),
    signUp: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/users/register", method: "POST", body }),
      transformResponse: (response: AuthResponse) => normalizeAuthResponse(response),
    }),
    batchUsers: builder.mutation<ApiUser[], BatchUsersRequest>({
      query: (body) => ({ url: "/users/batch", method: "POST", body }),
      transformResponse: (response: BatchUsersResponse | ApiUser[]) =>
        (Array.isArray(response) ? response : response.users ?? []).map((user) =>
          normalizeApiUser(user as ApiUser & { role?: UserRole }),
        ),
    }),
    listUsers: builder.query<ListUsersResponse, ListUsersRequest | undefined>({
      query: (args) => ({
        url: "/users",
        params: args ?? undefined,
      }),
      transformResponse: (response: ListUsersResponse) => ({
        items: (response.items ?? []).map((user) =>
          normalizeApiUser(user as ApiUser & { role?: UserRole }),
        ),
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: "User" as const, id: user.id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation<ApiUser, UpdateUserRequest>({
      query: ({ id, name }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "PUT",
        body: { name },
      }),
      transformResponse: (response: ApiUser) =>
        normalizeApiUser(response as ApiUser & { role?: UserRole }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),
    updateUserRole: builder.mutation<ApiUser, UpdateRoleRequest>({
      query: ({ id, role }) => ({
        url: `/users/${encodeURIComponent(id)}/role`,
        method: "PUT",
        body: { role },
      }),
      transformResponse: (response: ApiUser) =>
        normalizeApiUser(response as ApiUser & { role?: UserRole }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
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
    listAllEvents: builder.query<EventRecord[], void>({
      query: () => ({ url: "/events/internal/events" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((event) => ({ type: "Event" as const, id: event.eventId })),
              { type: "Event" as const, id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
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
      invalidatesTags: [{ type: "Event", id: "LIST" }],
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
      ],
    }),
    updateEventStatus: builder.mutation<EventRecord, { eventId: string; status: EventStatus }>({
      query: ({ eventId, status }) => ({
        url: `/events/${encodeURIComponent(eventId)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Event", id: arg.eventId },
        { type: "Event", id: "LIST" },
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
        (response?.data ?? []).map((payment) =>
          normalizePaymentRecord(payment as Partial<PaymentRecord> & Record<string, unknown>),
        ),
      providesTags: (result) =>
        result
          ? [
              ...result.map((payment) => ({ type: "Payment" as const, id: payment.paymentId })),
              { type: "Payment" as const, id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),
    getPaymentById: builder.query<PaymentRecord, string>({
      query: (id) => ({ url: `/payments/${encodeURIComponent(id)}` }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) =>
        normalizePaymentRecord(
          (response.data ?? {}) as Partial<PaymentRecord> & Record<string, unknown>,
        ),
      providesTags: (_result, _err, id) => [{ type: "Payment", id }],
    }),
    createPayment: builder.mutation<PaymentRecord, CreatePaymentRequest>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) =>
        normalizePaymentRecord(
          (response.data ?? {}) as Partial<PaymentRecord> & Record<string, unknown>,
        ),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
    updatePaymentStatus: builder.mutation<PaymentRecord, UpdatePaymentStatusRequest>({
      query: ({ id, status, paymentMethod }) => ({
        url: `/payments/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { status, paymentMethod },
      }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) =>
        normalizePaymentRecord(
          (response.data ?? {}) as Partial<PaymentRecord> & Record<string, unknown>,
        ),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Payment", id: arg.id },
        { type: "Payment", id: "LIST" },
        { type: "Booking", id: "LIST" },
      ],
    }),
    completePayment: builder.mutation<PaymentRecord, CompletePaymentRequest>({
      query: ({ id, status, paymentMethod }) => ({
        url: `/payments/${encodeURIComponent(id)}/complete`,
        method: "POST",
        body: paymentMethod ? { status, paymentMethod } : { status },
      }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) =>
        normalizePaymentRecord(
          (response.data ?? {}) as Partial<PaymentRecord> & Record<string, unknown>,
        ),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Payment", id: arg.id },
        { type: "Payment", id: "LIST" },
        { type: "Booking", id: "LIST" },
      ],
    }),
    cancelPayment: builder.mutation<PaymentRecord, string>({
      query: (id) => ({ url: `/payments/${encodeURIComponent(id)}/cancel`, method: "PATCH" }),
      transformResponse: (response: ServiceEnvelope<PaymentRecord>) =>
        normalizePaymentRecord(
          (response.data ?? {}) as Partial<PaymentRecord> & Record<string, unknown>,
        ),
      invalidatesTags: (_result, _err, id) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
      ],
    }),
    createRefund: builder.mutation<RefundRecord, CreateRefundRequest>({
      query: (body) => ({ url: "/refunds", method: "POST", body }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) =>
        normalizeRefundRecord(
          (response.data ?? {}) as Partial<RefundRecord> & Record<string, unknown>,
        ),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Payment", id: arg.paymentId },
        { type: "Payment", id: "LIST" },
        { type: "Refund", id: `PAYMENT:${arg.paymentId}` },
        { type: "Refund", id: "LIST" },
      ],
    }),
    updateRefundStatus: builder.mutation<RefundRecord, UpdateRefundStatusRequest>({
      query: ({ refundId, status }) => ({
        url: `/refunds/${encodeURIComponent(refundId)}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) =>
        normalizeRefundRecord(
          (response.data ?? {}) as Partial<RefundRecord> & Record<string, unknown>,
        ),
      invalidatesTags: (_result, _err, arg) => [{ type: "Refund", id: arg.refundId }],
    }),
    getRefundById: builder.query<RefundRecord, string>({
      query: (id) => ({ url: `/refunds/${encodeURIComponent(id)}` }),
      transformResponse: (response: ServiceEnvelope<RefundRecord>) =>
        normalizeRefundRecord(
          (response.data ?? {}) as Partial<RefundRecord> & Record<string, unknown>,
        ),
      providesTags: (_result, _err, id) => [{ type: "Refund", id }],
    }),
    listRefunds: builder.query<RefundRecord[], { all?: boolean } | void>({
      query: (args) => ({
        url: "/refunds",
        params: args?.all ? { all: true } : undefined,
      }),
      transformResponse: (response: ServiceEnvelope<RefundRecord[]>) =>
        (response.data ?? []).map((refund) =>
          normalizeRefundRecord(refund as Partial<RefundRecord> & Record<string, unknown>),
        ),
      providesTags: (result) =>
        result
          ? [
              ...result.map((refund) => ({ type: "Refund" as const, id: refund.refundId })),
              { type: "Refund" as const, id: "LIST" },
            ]
          : [{ type: "Refund", id: "LIST" }],
    }),
    getRefundsByPaymentId: builder.query<RefundRecord[], string>({
      query: (paymentId) => ({
        url: `/refunds/payment/${encodeURIComponent(paymentId)}`,
      }),
      transformResponse: (response: ServiceEnvelope<RefundRecord[]>) =>
        (response.data ?? []).map((refund) =>
          normalizeRefundRecord(refund as Partial<RefundRecord> & Record<string, unknown>),
        ),
      providesTags: (result, _err, paymentId) =>
        result
          ? [
              ...result.map((refund) => ({ type: "Refund" as const, id: refund.refundId })),
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
    startBookingPayment: builder.mutation<
      StartPaymentResponse,
      { bookingId: string; paymentMethod?: "CARD" | "BANK_TRANSFER" | "WALLET" }
    >({
      query: ({ bookingId, paymentMethod }) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/start-payment`,
        method: "POST",
        body: paymentMethod ? { paymentMethod } : undefined,
      }),
      transformResponse: (response: StartPaymentResponse) => response,
      invalidatesTags: (_result, _err, arg) => [
        { type: "Booking", id: arg.bookingId },
        { type: "Booking", id: "LIST" },
        { type: "Payment", id: "LIST" },
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
  useListUsersQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useListEventsQuery,
  useListAllEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useUpdateEventStatusMutation,
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
  useCompletePaymentMutation,
  useCancelPaymentMutation,
  useCreateRefundMutation,
  useUpdateRefundStatusMutation,
  useGetRefundByIdQuery,
  useListRefundsQuery,
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
