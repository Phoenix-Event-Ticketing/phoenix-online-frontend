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
};

const initialState: SessionState = {
  status: "unknown",
  user: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<SessionUser>) {
      state.status = "authenticated";
      state.user = action.payload;
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
    },
  },
});

export const { setAuthenticated, setUnauthenticated } = sessionSlice.actions;
export default sessionSlice.reducer;
