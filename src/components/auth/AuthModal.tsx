"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { persistUiSession } from "@/lib/auth-ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSession, type SessionUser } from "@/store/sessionSlice";
import { useSignInMutation, useSignUpMutation, type ApiUser } from "@/store/api";

type Mode = "signin" | "signup";
type MutationErrorLike = {
  status?: number | string;
  data?: { message?: string; error?: { message?: string } };
};

export function AuthModal({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionStatus = useAppSelector((s) => s.session.status);
  const [tab, setTab] = useState<Mode>(mode);

  useEffect(() => setTab(mode), [mode]);
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      onClose();
    }
  }, [sessionStatus, onClose]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [signIn] = useSignInMutation();
  const [signUp] = useSignUpMutation();

  const title = useMemo(() => (tab === "signin" ? "Sign in" : "Sign up"), [tab]);

  function toSessionUser(user: ApiUser | undefined, fallbackEmail: string): SessionUser {
    if (!user) {
      return {
        id: `user_${fallbackEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email: fallbackEmail,
        name: fallbackEmail.split("@")[0],
        roles: ["USER"],
      };
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles ?? ["USER"],
    };
  }

  function getAccessToken(payload: {
    accessToken?: string;
    access_token?: string;
    token?: string;
  }): string | null {
    return payload.accessToken ?? payload.access_token ?? payload.token ?? null;
  }

  function getAuthErrorMessage(err: unknown, currentMode: Mode): string {
    const mutationError = err as MutationErrorLike;
    const status = mutationError?.status;
    if (currentMode === "signin" && status === 401) {
      return "Incorrect email or password. Please try again.";
    }
    const apiMessage =
      mutationError?.data?.error?.message ??
      mutationError?.data?.message;
    if (apiMessage) return apiMessage;
    if (err instanceof Error && err.message) return err.message;
    return "Something went wrong. Please try again.";
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {tab === "signin"
                  ? "Use your account to access the demo."
                  : "Create an account for the demo."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setError(null);
                setInfo(null);
              }}
              className={[
                "flex-1 rounded-md px-3 py-2 font-medium transition-colors",
                tab === "signin"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
              ].join(" ")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError(null);
                setInfo(null);
              }}
              className={[
                "flex-1 rounded-md px-3 py-2 font-medium transition-colors",
                tab === "signup"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
              ].join(" ")}
            >
              Sign up
            </button>
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setInfo(null);
              setSubmitting(true);
              try {
                const cleanEmail = email.trim().toLowerCase();

                if (tab === "signup") {
                  await signUp({ email: cleanEmail, password, name: name.trim() || undefined }).unwrap();
                  setPassword("");
                  setShowPassword(false);
                  setTab("signin");
                  setInfo("Account created. Please sign in to continue.");
                } else {
                  const res = await signIn({ email: cleanEmail, password }).unwrap();
                  const accessToken = getAccessToken(res);
                  if (!accessToken) {
                    throw new Error("No access token returned from login endpoint.");
                  }

                  const session = {
                    user: toSessionUser(res.user, cleanEmail),
                    accessToken,
                  };
                  persistUiSession(session);
                  dispatch(setSession(session));
                  setShowPassword(false);
                  router.replace("/dashboard");
                  router.refresh();
                }
              } catch (e) {
                setError(getAuthErrorMessage(e, tab));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {tab === "signup" ? (
              <label className="block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name (optional)
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </span>
              <div className="relative mt-1">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-12 text-sm text-zinc-950 shadow-sm outline-none ring-zinc-950/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-50/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center px-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {info ? <p className="text-sm text-emerald-700">{info}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {tab === "signin"
                ? submitting
                  ? "Signing in..."
                  : "Sign in"
                : submitting
                  ? "Processing..."
                  : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
