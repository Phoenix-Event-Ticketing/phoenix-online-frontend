import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/store/api";
import sessionReducer from "@/store/sessionSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
