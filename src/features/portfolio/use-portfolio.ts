"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

export type PortfolioOverview = {
  wallet_balances?: unknown[];
  market_prices?: unknown[];
  source?: string;
};

export function usePortfolioOverview() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["portfolio-overview", token],
    queryFn: async (): Promise<PortfolioOverview> => {
      if (!token) {
        throw new ApiClientError("Please sign in again.", {
          status: 401,
          code: "UNAUTHENTICATED",
          retryable: false,
        });
      }
      return laravelFetch<PortfolioOverview>(API.app.portfolio.overview, { token });
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function usePortfolioHistory() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["portfolio-history", token],
    queryFn: async () => {
      if (!token) {
        throw new ApiClientError("Please sign in again.", {
          status: 401,
          code: "UNAUTHENTICATED",
          retryable: false,
        });
      }
      return laravelFetch<{ snapshots?: unknown }>(API.app.portfolio.history, {
        token,
      });
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 60_000,
  });
}
