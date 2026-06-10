"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type {
  CardCheckoutBody,
  CardCheckoutResponse,
  CardOverviewPayload,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useCardOverviewQuery() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["card-overview", token],
    queryFn: () =>
      laravelFetch<CardOverviewPayload>(API.app.card.overview, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
  });
}

export function useCardCheckoutMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CardCheckoutBody) =>
      laravelFetch<CardCheckoutResponse>(API.app.card.orders, {
        method: "POST",
        body,
        token: assertToken(token),
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card-overview"] });
    },
    retry: false,
  });
}

export function useRefreshCardOrderMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      laravelFetch<CardCheckoutResponse>(API.app.card.refreshOrder(orderId), {
        method: "POST",
        token: assertToken(token),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card-overview"] });
    },
    retry: false,
  });
}
