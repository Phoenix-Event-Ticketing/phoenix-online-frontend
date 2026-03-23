"use client";

import { Provider } from "react-redux";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import { store } from "@/store/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      {children}
    </Provider>
  );
}
