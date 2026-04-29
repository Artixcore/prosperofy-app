"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { DashboardSummary } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useDashboardSummaryQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["v1-dashboard-summary", token],
    queryFn: () => laravelFetch<DashboardSummary>(API.v1.dashboardSummary, { token }),
    enabled: Boolean(token),
  });
}
