"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ActivityItem, AppListResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export type ActivityQueryParams = {
  perPage?: number;
  page?: number;
};

function toActivityPath(params?: ActivityQueryParams): string {
  const query = new URLSearchParams();
  if (params?.perPage) query.set("per_page", String(params.perPage));
  if (params?.page) query.set("page", String(params.page));
  const suffix = query.toString();
  return suffix ? `${API.app.activity.list}?${suffix}` : API.app.activity.list;
}

export function useActivityQuery(params?: ActivityQueryParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["app-activity", token, params?.perPage, params?.page],
    queryFn: () =>
      laravelFetch<AppListResponse<ActivityItem>>(toActivityPath(params), {
        token,
      }),
    enabled: Boolean(token),
  });
}
