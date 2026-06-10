"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type {
  ReferralMember,
  RewardLedgerItem,
  RewardMonthlySummaryItem,
  RewardsOverview,
} from "@/types/rewards";

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

function authGuard(token: string | null): asserts token is string {
  if (!token) {
    throw new ApiClientError("Please sign in again.", {
      status: 401,
      code: "UNAUTHENTICATED",
      retryable: false,
    });
  }
}

export function useRewardsOverview() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["rewards-overview", token],
    queryFn: async (): Promise<RewardsOverview> => {
      authGuard(token);
      return laravelFetch<RewardsOverview>(API.app.rewards.overview, { token });
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function useRewardsReferrals(page = 1, perPage = 20) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["rewards-referrals", token, page, perPage],
    queryFn: async (): Promise<PaginatedResponse<ReferralMember>> => {
      authGuard(token);
      return laravelFetch<PaginatedResponse<ReferralMember>>(
        `${API.app.rewards.referrals}?page=${page}&per_page=${perPage}`,
        { token },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function useRewardsLedger(page = 1, perPage = 20) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["rewards-ledger", token, page, perPage],
    queryFn: async (): Promise<PaginatedResponse<RewardLedgerItem>> => {
      authGuard(token);
      return laravelFetch<PaginatedResponse<RewardLedgerItem>>(
        `${API.app.rewards.ledger}?page=${page}&per_page=${perPage}`,
        { token },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function useRewardsMonthlySummary(months = 12) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["rewards-monthly-summary", token, months],
    queryFn: async (): Promise<{ items: RewardMonthlySummaryItem[] }> => {
      authGuard(token);
      return laravelFetch<{ items: RewardMonthlySummaryItem[] }>(
        `${API.app.rewards.monthlySummary}?months=${months}`,
        { token },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 60_000,
  });
}
