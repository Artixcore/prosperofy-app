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

export type CandleBar = {
  timestamp?: string | null;
  open?: string | null;
  high?: string | null;
  low?: string | null;
  close?: string | null;
};

export type MarketCandlesPayload = {
  symbol?: string;
  resolution?: string;
  items?: CandleBar[];
};

export function useMarketCandles(
  assetClass: string,
  symbol: string,
  resolution: string,
  fromSec: number,
  toSec: number,
  enabled: boolean,
) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["market-candles", assetClass, symbol, resolution, fromSec, toSec, token],
    queryFn: async (): Promise<MarketCandlesPayload> => {
      const t = assertToken(token);
      const params = new URLSearchParams({
        asset_class: assetClass,
        symbol,
        resolution,
        from: String(fromSec),
        to: String(toSec),
      });
      return laravelFetch<MarketCandlesPayload>(
        `${API.app.market.candles}?${params.toString()}`,
        { token: t },
      );
    },
    enabled: Boolean(
      authReady && isAuthenticated && token && enabled && symbol.length > 0,
    ),
    staleTime: 60_000,
    retry: false,
  });
}
