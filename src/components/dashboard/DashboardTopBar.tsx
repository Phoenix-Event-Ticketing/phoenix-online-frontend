"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearUiAuth } from "@/lib/auth-ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUnauthenticated } from "@/store/sessionSlice";

function initials(name: string | undefined, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || email[0]?.toUpperCase() || "?";
  }
  return email.slice(0, 2).toUpperCase();
}

export function DashboardTopBar({ title }: { title: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.session.user);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearUiAuth();
    dispatch(setUnauthenticated());
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (!user) return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {title}
      </h1>

      <div className="relative flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {initials(user.name, user.email)}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {user.name ?? user.email}
            </span>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
          </span>
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
              role="menu"
            >
              <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800 sm:hidden">
                <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {user.name ?? "User"}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Log out
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
