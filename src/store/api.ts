import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

type MeResponse = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
};

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const encoded = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${encodeURIComponent(name)}=`));
  if (!encoded) return undefined;
  return decodeURIComponent(encoded.split("=").slice(1).join("="));
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    const csrf = getCookie("csrf_token");
    if (csrf) headers.set("X-CSRF-Token", csrf);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (!refreshResult.error) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    me: builder.query<MeResponse, void>({
      query: () => ({ url: "/auth/me" }),
    }),
    signIn: builder.mutation<void, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    signUp: builder.mutation<
      void,
      { email: string; password: string; name?: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useMeQuery,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
} = api;
