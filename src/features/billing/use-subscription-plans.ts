"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { SubscriptionPlansPayload } from "@/lib/api/types";
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

export function useSubscriptionPlans() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["subscription-plans", token],
    queryFn: () =>
      laravelFetch<SubscriptionPlansPayload>(API.app.billing.plans, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: 1,
  });
}
