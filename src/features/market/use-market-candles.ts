"use client";

import { useQuery } from "@tanstack/react-query";
import { getMarketCandles } from "@/lib/api/market";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import { marketQueryRetry } from "@/features/market/market-query-retry";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export type CandleBar = {
  time?: number | null;
  timestamp?: string | number | null;
  open?: string | null;
  high?: string | null;
  low?: string | null;
  close?: string | null;
  volume?: string | null;
};

export type ChartPoint = {
  time?: number | null;
  timestamp?: string | number | null;
  price?: string | null;
};

export type MarketCandlesPayload = {
  symbol?: string;
  resolution?: string;
  points?: ChartPoint[];
  candles?: CandleBar[];
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
      return getMarketCandles(t, symbol, resolution, fromSec, toSec, assetClass);
    },
    enabled: Boolean(
      authReady && isAuthenticated && token && enabled && symbol.length > 0,
    ),
    staleTime: 60_000,
    refetchInterval: 90_000,
    retry: marketQueryRetry,
  });
}
