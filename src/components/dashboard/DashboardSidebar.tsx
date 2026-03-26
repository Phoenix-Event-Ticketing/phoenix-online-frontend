"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/events", label: "Events", exact: false },
  { href: "/dashboard/payments", label: "Payments", exact: false },
  { href: "/dashboard/bookings", label: "Bookings", exact: false },
  { href: "/dashboard/inventory", label: "Inventory", exact: false },
  { href: "/dashboard/users", label: "Users", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          Dashboard
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href="/"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
