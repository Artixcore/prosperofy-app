"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

export type MarketQuotePayload = {
  provider?: string;
  asset_class?: string;
  symbol?: string;
  display_symbol?: string | null;
  timestamp?: string | null;
  bid?: string | null;
  ask?: string | null;
  mid?: string | null;
  last?: string | null;
  price?: string | null;
  volume_24h?: string | null;
  change_24h_percent?: string | null;
  change_percentage_24h?: string | null;
  open?: string | null;
  high?: string | null;
  low?: string | null;
  close?: string | null;
  volume?: string | null;
  source?: string;
  is_live?: boolean;
};

import { marketQueryRetry } from "@/features/market/market-query-retry";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useMarketQuote(assetClass: string, symbol: string) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["market-quote", assetClass, symbol, token],
    queryFn: async (): Promise<MarketQuotePayload> => {
      const t = assertToken(token);
      const params = new URLSearchParams({
        asset_class: assetClass,
        symbol,
      });
      return laravelFetch<MarketQuotePayload>(
        `${API.app.market.quote}?${params.toString()}`,
        { token: t },
      );
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
    refetchInterval: 45_000,
    retry: marketQueryRetry,
  });
}
