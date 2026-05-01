"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  AppSettingsOverviewData,
  UserSettingsPatchResponse,
  UserSettingsPreferencesBody,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useSettingsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-settings", token],
    queryFn: () =>
      laravelFetch<AppSettingsOverviewData>(API.app.settings, {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useUpdateSettingsMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserSettingsPreferencesBody) =>
      laravelFetch<UserSettingsPatchResponse>(API.app.settings, {
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
