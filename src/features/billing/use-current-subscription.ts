"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { CurrentSubscription } from "@/lib/api/types";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useCurrentSubscription(options?: { pollUntilActive?: boolean }) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["current-subscription", token],
    queryFn: () =>
      laravelFetch<CurrentSubscription>(API.app.billing.subscription, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    refetchInterval: (query) => {
      if (!options?.pollUntilActive) {
        return false;
      }
      const slug = query.state.data?.plan_slug;
      const status = query.state.data?.status;
      if (status === "active" && slug && slug !== "free") {
        return false;
      }
      return 5000;
    },
    retry: 1,
  });
}
