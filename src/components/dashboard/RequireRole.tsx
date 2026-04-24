"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessTab, type DashboardTabKey } from "@/components/dashboard/access";
import { useAppSelector } from "@/store/hooks";

export function RequireRole({
  tab,
  children,
}: {
  tab: DashboardTabKey;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const status = useAppSelector((s) => s.session.status);
  const roles = useAppSelector((s) => s.session.user?.roles);
  const allowed = canAccessTab(tab, roles);

  useEffect(() => {
    if (status === "authenticated" && !allowed) {
      router.replace("/dashboard");
    }
  }, [allowed, router, status]);

  if (status !== "authenticated") {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
