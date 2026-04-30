"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoadingState } from "@/components/system/loading-state";
import { useAuth } from "@/lib/auth/session-context";
import { clearAuthCookie } from "@/lib/auth/cookies";
import { loadSession } from "@/lib/auth/storage";

export function DashboardGate({ children }: { children: ReactNode }) {
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus !== "authenticated") {
      clearAuthCookie();
      router.replace("/login");
      return;
    }
    const s = loadSession();
    if (!s?.token) {
      clearAuthCookie();
      router.replace("/login");
    }
  }, [authStatus, router]);

  if (authStatus !== "authenticated") {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState label="Restoring session…" />
      </div>
    );
  }

  return <>{children}</>;
}
