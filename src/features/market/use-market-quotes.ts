"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type { MarketQuotePayload } from "@/features/market/use-market-quote";
import { marketQueryRetry } from "@/features/market/market-query-retry";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export type MarketQuotesEnvelope = {
  quotes?: MarketQuotePayload[];
  items?: MarketQuotePayload[];
};

export function useMarketQuotes(assetClass: string, symbols: string[]) {
  const { token, authReady, isAuthenticated } = useAuth();
  const key = symbols.join(",");

  return useQuery({
    queryKey: ["market-quotes", assetClass, key, token],
    queryFn: async (): Promise<MarketQuotePayload[]> => {
      const t = assertToken(token);
      const params = new URLSearchParams({
        asset_class: assetClass,
        symbols: symbols.map((s) => s.toUpperCase()).join(","),
      });
      const data = await laravelFetch<MarketQuotesEnvelope>(
        `${API.app.market.quotes}?${params.toString()}`,
        { token: t },
      );
      const rows = data.quotes ?? data.items;
      return Array.isArray(rows) ? rows : [];
    },
    enabled: Boolean(
      authReady && isAuthenticated && token && symbols.length > 0,
    ),
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: marketQueryRetry,
  });
}
