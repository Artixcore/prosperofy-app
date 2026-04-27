"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { AppListResponse, AppNotification, MarkedCount } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export type NotificationsQueryParams = {
  unread?: boolean;
  perPage?: number;
  page?: number;
};

function toNotificationsPath(params?: NotificationsQueryParams): string {
  const query = new URLSearchParams();
  if (params?.unread) query.set("unread", "1");
  if (params?.perPage) query.set("per_page", String(params.perPage));
  if (params?.page) query.set("page", String(params.page));
  const suffix = query.toString();
  return suffix ? `${API.app.notifications.list}?${suffix}` : API.app.notifications.list;
}

export function useNotificationsQuery(params?: NotificationsQueryParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["app-notifications", token, params?.unread, params?.perPage, params?.page],
    queryFn: () =>
      laravelFetch<AppListResponse<AppNotification>>(toNotificationsPath(params), {
        token,
      }),
    enabled: Boolean(token),
  });
}

export function useMarkNotificationReadMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      laravelFetch<AppNotification>(API.app.notifications.read(notificationId), {
        method: "POST",
        body: {},
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      laravelFetch<MarkedCount>(API.app.notifications.readAll, {
        method: "POST",
        body: {},
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-notifications"] });
    },
  });
}
