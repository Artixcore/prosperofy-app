"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { UserProfile, UserProfilePatchBody } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useProfileQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-profile", token],
    queryFn: () =>
      laravelFetch<UserProfile>(API.app.profile, {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useUpdateProfileMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserProfilePatchBody) =>
      laravelFetch<UserProfile>(API.app.profile, {
        method: "PATCH",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-profile"] });
      qc.invalidateQueries({ queryKey: ["app-dashboard"] });
    },
  });
}
