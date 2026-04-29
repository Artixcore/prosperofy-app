"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ThemePreferencePayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useThemePreferenceQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["v1-theme", token],
    queryFn: () => laravelFetch<ThemePreferencePayload>(API.v1.theme, { token }),
    enabled: Boolean(token),
  });
}

export function useUpdateThemePreferenceMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (theme_preference: ThemePreferencePayload["theme_preference"]) =>
      laravelFetch<ThemePreferencePayload>(API.v1.theme, {
        method: "PATCH",
        body: { theme_preference },
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["v1-theme"] });
      qc.invalidateQueries({ queryKey: ["app-profile"] });
    },
  });
}
