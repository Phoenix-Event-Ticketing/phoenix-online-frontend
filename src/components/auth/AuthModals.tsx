"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "@/components/auth/AuthModal";

export function AuthModals() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const auth = searchParams.get("auth");
  const mode = auth === "signup" ? "signup" : auth === "signin" ? "signin" : null;

  if (!mode) return null;

  return (
    <AuthModal
      mode={mode}
      onClose={() => {
        const next = new URLSearchParams(searchParams);
        next.delete("auth");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      }}
    />
  );
}

