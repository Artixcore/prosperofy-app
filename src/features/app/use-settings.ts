"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { UserSettingsPayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useSettingsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-settings", token],
    queryFn: () =>
      laravelFetch<UserSettingsPayload>(API.app.settings, {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useUpdateSettingsMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserSettingsPayload["settings"]) =>
      laravelFetch<UserSettingsPayload>(API.app.settings, {
        method: "PATCH",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      qc.invalidateQueries({ queryKey: ["app-dashboard"] });
    },
  });
}
