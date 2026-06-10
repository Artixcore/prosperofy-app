"use client";

import { useQuery } from "@tanstack/react-query";
import { getMarketQuotes } from "@/lib/api/market";
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

export function useMarketQuotes(assetClass: string, symbols: string[]) {
  const { token, authReady, isAuthenticated } = useAuth();
  const key = symbols.join(",");

  return useQuery({
    queryKey: ["market-quotes", assetClass, key, token],
    queryFn: async (): Promise<MarketQuotePayload[]> => {
      const t = assertToken(token);
      return getMarketQuotes(t, symbols, assetClass);
    },
    enabled: Boolean(
      authReady && isAuthenticated && token && symbols.length > 0,
    ),
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: marketQueryRetry,
  });
}
