"use client";

import { useEffect } from "react";
import { readPersistedUiSession } from "@/lib/auth-ui";
import { setHydrationComplete, setSession } from "@/store/sessionSlice";
import { useAppDispatch } from "@/store/hooks";

/** Hydrates Redux from sessionStorage once on the client (no fetch). */
export function SessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const persisted = readPersistedUiSession();
    if (persisted) {
      dispatch(
        setSession({
          user: persisted.user,
          tokenPlaceholder: persisted.tokenPlaceholder,
        }),
      );
    } else {
      dispatch(setHydrationComplete());
    }
  }, [dispatch]);

  return null;
}
