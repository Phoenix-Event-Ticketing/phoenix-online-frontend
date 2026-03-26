"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

export function ProfilePanel() {
  const user = useAppSelector((s) => s.session.user);
  const [name, setName] = useState(user?.name ?? "");

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No user session found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          My profile
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Email
            </p>
            <p className="truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-50">
              {user.email}
            </p>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
              placeholder="Your name"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            onClick={() => {
              // UI placeholder for PUT /api/v1/users/{id}
              alert(`Profile update demo\\n\\nName: ${name || "(empty)"}`);
            }}
          >
            Save changes
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60"
            onClick={() => {
              // UI placeholder for DELETE_ACCOUNT
              alert("Delete account demo (no API wired).");
            }}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

