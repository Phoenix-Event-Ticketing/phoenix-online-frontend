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
  /**
   * UI-only stand-in for “credentials present”.
   * In production, auth is HttpOnly cookies — this is for demo / future wiring.
   */
  tokenPlaceholder: string | null;
};

const initialState: SessionState = {
  status: "unknown",
  user: null,
  tokenPlaceholder: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    /** Full UI session (user + optional token ref for headers later). */
    setSession(
      state,
      action: PayloadAction<{ user: SessionUser; tokenPlaceholder: string }>,
    ) {
      state.status = "authenticated";
      state.user = action.payload.user;
      state.tokenPlaceholder = action.payload.tokenPlaceholder;
    },
    setAuthenticated(state, action: PayloadAction<SessionUser>) {
      state.status = "authenticated";
      state.user = action.payload;
      state.tokenPlaceholder = null;
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
      state.tokenPlaceholder = null;
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
