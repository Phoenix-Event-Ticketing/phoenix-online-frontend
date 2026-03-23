"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/events")) return "Events";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/dashboard")) return "Overview";
  return "Dashboard";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-900">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar title={title} />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
