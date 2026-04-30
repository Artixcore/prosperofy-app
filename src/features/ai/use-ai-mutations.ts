"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { OrchestrationJob } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useMarketAnalysisMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.v1.analysisMarket, {
        method: "POST",
        body,
        token,
      }),
  });
}

export function useStrategyGenerateMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.v1.strategyGenerate, {
        method: "POST",
        body,
        token,
      }),
  });
}

export function useRiskScoreMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.v1.riskScore, {
        method: "POST",
        body,
        token,
      }),
  });
}

export function useQuantBacktestMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.v1.quantBacktestTrend, {
        method: "POST",
        body,
        token,
      }),
  });
}

export function useStrategyEvaluateDispatchMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<{
        queued?: boolean;
        job_id?: string;
        correlation_id?: string;
        status?: string;
      }>(API.app.v1.strategyEvaluateDispatch, {
        method: "POST",
        body,
        token,
      }),
  });
}

function isTerminalJobStatus(status: string): boolean {
  return ["completed", "failed", "cancelled"].includes(status);
}

export function useOrchestrationJobQuery(jobId: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["orchestration-job", jobId, token],
    queryFn: () =>
      laravelFetch<OrchestrationJob>(API.app.v1.orchestrationJob(jobId!), {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token && jobId),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (!s || isTerminalJobStatus(s)) return false;
      return 2500;
    },
  });
}
