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

/** Backend origin (no trailing slash). Override via NEXT_PUBLIC_API_BASE_URL for production builds. */
function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
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

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["Event"],
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
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useBatchUsersMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useListEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
} = api;
