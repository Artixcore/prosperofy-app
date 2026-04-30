"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { AppDashboardPayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useAppDashboardQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-dashboard", token],
    queryFn: () =>
      laravelFetch<AppDashboardPayload>(API.app.dashboard, {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}
