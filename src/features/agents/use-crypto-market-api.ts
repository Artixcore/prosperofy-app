"use client";

import { useMutation } from "@tanstack/react-query";
import { getAgentMutationTimeoutMs, laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type {
  CryptoMarketAnalyzeRequest,
  CryptoMarketAnalyzeResponse,
  CryptoMarketFullReportRequest,
  CryptoMarketFullReportResponse,
  CryptoMarketHistoryRequest,
  CryptoMarketHistoryResponse,
  CryptoMarketManipulationRiskRequest,
  CryptoMarketManipulationRiskResponse,
  CryptoMarketSentimentRequest,
  CryptoMarketSentimentResponse,
  CryptoMarketWhaleActivityRequest,
  CryptoMarketWhaleActivityResponse,
} from "@/types/crypto-market";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

function cryptoMarketMutationOptions(token: string | null) {
  return {
    token: assertToken(token),
    timeoutMs: getAgentMutationTimeoutMs(),
  };
}

export function useCryptoMarketAnalyzeMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketAnalyzeRequest) =>
      laravelFetch<CryptoMarketAnalyzeResponse>(
        API.app.agents.cryptoMarket.analyze,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}

export function useCryptoMarketHistoryMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketHistoryRequest) =>
      laravelFetch<CryptoMarketHistoryResponse>(
        API.app.agents.cryptoMarket.history,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}

export function useCryptoMarketSentimentMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketSentimentRequest) =>
      laravelFetch<CryptoMarketSentimentResponse>(
        API.app.agents.cryptoMarket.sentiment,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}

export function useCryptoMarketWhaleActivityMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketWhaleActivityRequest) =>
      laravelFetch<CryptoMarketWhaleActivityResponse>(
        API.app.agents.cryptoMarket.whaleActivity,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}

export function useCryptoMarketManipulationRiskMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketManipulationRiskRequest) =>
      laravelFetch<CryptoMarketManipulationRiskResponse>(
        API.app.agents.cryptoMarket.manipulationRisk,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}

export function useCryptoMarketFullReportMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: CryptoMarketFullReportRequest) =>
      laravelFetch<CryptoMarketFullReportResponse>(
        API.app.agents.cryptoMarket.fullReport,
        {
          method: "POST",
          body,
          ...cryptoMarketMutationOptions(token),
        },
      ),
    retry: false,
  });
}
