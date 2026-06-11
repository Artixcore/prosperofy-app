"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type { PayoutHistoryResponse, PayoutProfile } from "@/types/payouts";

function authGuard(token: string | null): asserts token is string {
  if (!token) {
    throw new ApiClientError("Please sign in again.", {
      status: 401,
      code: "UNAUTHENTICATED",
      retryable: false,
    });
  }
}

export function usePayoutProfile() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["payout-profile", token],
    queryFn: async (): Promise<PayoutProfile> => {
      authGuard(token);
      const data = await laravelFetch<{ payout_profile: PayoutProfile }>(API.app.rewards.payoutProfile, {
        token,
      });
      return data.payout_profile;
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function useSavePayoutProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { wallet_address: string; payout_currency?: string }) => {
      authGuard(token);
      const data = await laravelFetch<{ payout_profile: PayoutProfile }>(API.app.rewards.payoutProfile, {
        method: "POST",
        token,
        body: input,
      });
      return data.payout_profile;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payout-profile"] });
    },
  });
}

export function usePayoutHistory(page = 1) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["payout-history", token, page],
    queryFn: async (): Promise<PayoutHistoryResponse> => {
      authGuard(token);
      return laravelFetch<PayoutHistoryResponse>(
        `${API.app.rewards.payoutHistory}?page=${page}&per_page=10`,
        { token },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}
