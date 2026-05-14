"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
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

/** Laravel returns AI envelope data; shape varies by provider — keep loose. */
export type MarketSymbolsSearchResult = Record<string, unknown>;

export function useMarketSymbolsSearch(
  assetClass: string,
  search: string,
  enabled: boolean,
) {
  const { token, authReady, isAuthenticated } = useAuth();
  const q = search.trim();

  return useQuery({
    queryKey: ["market-symbols", assetClass, q, token],
    queryFn: async (): Promise<MarketSymbolsSearchResult> => {
      const t = assertToken(token);
      const params = new URLSearchParams({
        asset_class: assetClass,
        size: "30",
      });
      if (q.length >= 1) params.set("search", q);
      return laravelFetch<MarketSymbolsSearchResult>(
        `${API.app.market.symbols}?${params.toString()}`,
        { token: t },
      );
    },
    enabled: Boolean(
      authReady && isAuthenticated && token && enabled && q.length >= 1,
    ),
    staleTime: 60_000,
    retry: false,
  });
}
