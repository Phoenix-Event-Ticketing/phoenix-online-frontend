/**
 * Client-side auth persistence helpers for static hosting.
 * API calls use NEXT_PUBLIC_API_BASE_URL and Bearer tokens (see store/api.ts).
 */

import type { SessionUser } from "@/store/sessionSlice";

const STORAGE_KEY = "phoenix_ui_session_v1";

export type PersistedUiSession = {
  user: SessionUser;
  accessToken: string;
};

/** Read persisted UI session (browser only). */
export function readPersistedUiSession(): PersistedUiSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedUiSession;
    if (!parsed?.user?.id || !parsed?.user?.email || !parsed?.accessToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistUiSession(data: PersistedUiSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearPersistedUiSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function clearUiAuth(): void {
  clearPersistedUiSession();
}

/** Whether the UI considers the user logged in (persisted). */
export function hasPersistedUiSession(): boolean {
  return readPersistedUiSession() !== null;
}

export function getPersistedAccessToken(): string | null {
  return readPersistedUiSession()?.accessToken ?? null;
}
