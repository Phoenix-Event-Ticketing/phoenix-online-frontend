import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
};

type SessionState = {
  status: "unknown" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
  accessToken: string | null;
};

const initialState: SessionState = {
  status: "unknown",
  user: null,
  accessToken: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    /** Full client session (user + bearer token). */
    setSession(
      state,
      action: PayloadAction<{ user: SessionUser; accessToken: string }>,
    ) {
      state.status = "authenticated";
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAuthenticated(state, action: PayloadAction<SessionUser>) {
      state.status = "authenticated";
      state.user = action.payload;
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
      state.accessToken = null;
    },
    setHydrationComplete(state) {
      if (state.status === "unknown") {
        state.status = "unauthenticated";
      }
    },
  },
});

export const {
  setSession,
  setAuthenticated,
  setUnauthenticated,
  setHydrationComplete,
} = sessionSlice.actions;
export default sessionSlice.reducer;
