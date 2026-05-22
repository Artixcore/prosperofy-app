"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type { MarketQuotePayload } from "@/features/market/use-market-quote";

export type MarketDashboardPayload = {
  quotes?: MarketQuotePayload[];
  trending?: { items?: unknown[]; is_live?: boolean; source?: string };
  global?: { data?: Record<string, unknown>; is_live?: boolean; source?: string };
  provider?: string;
};

export function useMarketDashboard(symbols?: string[]) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["market-dashboard", symbols?.join(",") ?? "", token],
    queryFn: async (): Promise<MarketDashboardPayload> => {
      if (!token) {
        throw new ApiClientError("Please sign in again.", {
          status: 401,
          code: "UNAUTHENTICATED",
          retryable: false,
        });
      }
      const params = symbols?.length
        ? `?symbols=${encodeURIComponent(symbols.map((s) => s.toUpperCase()).join(","))}`
        : "";
      return laravelFetch<MarketDashboardPayload>(
        `${API.app.market.dashboard}${params}`,
        { token },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
    retry: false,
  });
}
