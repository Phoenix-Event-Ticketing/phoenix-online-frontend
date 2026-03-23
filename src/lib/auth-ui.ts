/**
 * UI-only auth helpers — no network calls.
 * Use these for dashboard flow until the real gateway + HttpOnly cookies are wired.
 * RTK Query /api proxy stays unchanged for future backend integration.
 */

import type { SessionUser } from "@/store/sessionSlice";

const STORAGE_KEY = "phoenix_ui_session_v1";

export type PersistedUiSession = {
  user: SessionUser;
  /** Opaque placeholder; real tokens stay HttpOnly on the server */
  tokenPlaceholder: string;
};

function randomTokenRef(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ui_${crypto.randomUUID()}`;
  }
  return `ui_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Read persisted UI session (browser only). */
export function readPersistedUiSession(): PersistedUiSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedUiSession;
    if (!parsed?.user?.id || !parsed?.user?.email || !parsed?.tokenPlaceholder) {
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

function buildUserFromSignIn(email: string): SessionUser {
  return {
    id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
    email,
    name: email.split("@")[0],
    roles: ["demo"],
  };
}

function buildUserFromSignUp(
  email: string,
  name: string | undefined,
): SessionUser {
  const base = buildUserFromSignIn(email);
  return { ...base, name: name?.trim() || base.name };
}

/**
 * Complete sign-in flow for UI only: returns session payload to dispatch + persist.
 * Does not call the backend.
 */
export function completeUiSignIn(input: {
  email: string;
  password: string;
}): PersistedUiSession {
  void input.password;
  return {
    user: buildUserFromSignIn(input.email.trim()),
    tokenPlaceholder: randomTokenRef(),
  };
}

/**
 * Complete sign-up flow for UI only: returns session payload to dispatch + persist.
 * Does not call the backend.
 */
export function completeUiSignUp(input: {
  email: string;
  password: string;
  name?: string;
}): PersistedUiSession {
  void input.password;
  return {
    user: buildUserFromSignUp(input.email.trim(), input.name),
    tokenPlaceholder: randomTokenRef(),
  };
}

/** Clear UI session (call after logout). */
export function clearUiAuth(): void {
  clearPersistedUiSession();
}

/** Whether the UI considers the user logged in (persisted). */
export function hasPersistedUiSession(): boolean {
  return readPersistedUiSession() !== null;
}
