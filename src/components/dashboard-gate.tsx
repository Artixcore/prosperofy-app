"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoadingState } from "@/components/system/loading-state";
import { useAuth } from "@/lib/auth/session-context";
import { clearAuthCookie } from "@/lib/auth/cookies";
import { loadSession } from "@/lib/auth/storage";

export function DashboardGate({ children }: { children: ReactNode }) {
  const { hydrated, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const s = loadSession();
    if (!s?.token || !token) {
      clearAuthCookie();
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState label="Restoring session…" />
      </div>
    );
  }

  return <>{children}</>;
}
