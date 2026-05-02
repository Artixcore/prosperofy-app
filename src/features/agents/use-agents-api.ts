"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type { AiAgent, AiAgentRunRow } from "@/types/agents";
import type { MarketSignal } from "@/types/signals";
import type { WflReward } from "@/types/rewards";
import { useAuth } from "@/lib/auth/session-context";

export type LaravelPaginator<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export type AgentDashboardPayload = {
  agents_enabled_count: number;
  latest_signal?: MarketSignal | null;
  latest_signals: MarketSignal[];
  latest_run?: unknown;
  reward_summary: {
    pending: number;
    claimable: number;
    claimed: number;
  };
};

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useAgentsCatalogQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agents-catalog"],
    queryFn: () =>
      laravelFetch<{ agents: AiAgent[] }>(API.app.agents.list, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 120_000,
  });
}

export function useAgentsDashboardQuery(refetchIntervalMs?: number) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agents-dashboard"],
    queryFn: () =>
      laravelFetch<AgentDashboardPayload>(API.app.agents.dashboard, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    refetchInterval: refetchIntervalMs,
    staleTime: 60_000,
  });
}

export function useAgentRunsQuery(page = 1) {
  const { token, authReady, isAuthenticated } = useAuth();
  const qs = page > 1 ? `?page=${page}` : "";
  return useQuery({
    queryKey: ["agent-runs", page],
    queryFn: () =>
      laravelFetch<{ runs: LaravelPaginator<AiAgentRunRow> }>(
        `${API.app.agents.runs}${qs}`,
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useSignalsQuery(page = 1) {
  const { token, authReady, isAuthenticated } = useAuth();
  const qs = page > 1 ? `?page=${page}` : "";
  return useQuery({
    queryKey: ["agent-signals", page],
    queryFn: () =>
      laravelFetch<{ signals: LaravelPaginator<MarketSignal> }>(
        `${API.app.agents.signals}${qs}`,
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useSignalDetailQuery(signalId: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agent-signal", signalId],
    queryFn: () =>
      laravelFetch<{ signal: MarketSignal }>(
        API.app.agents.signalDetail(signalId!),
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && signalId),
  });
}

export function useRewardsQuery(page = 1) {
  const { token, authReady, isAuthenticated } = useAuth();
  const qs = page > 1 ? `?page=${page}` : "";
  return useQuery({
    queryKey: ["agent-rewards", page],
    queryFn: () =>
      laravelFetch<{ rewards: LaravelPaginator<WflReward> }>(
        `${API.app.agents.rewards}${qs}`,
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useRunAgentMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.agents.run, {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agents-dashboard"] });
      void qc.invalidateQueries({ queryKey: ["agent-runs"] });
    },
  });
}

export type SignalGenerateResponse = {
  signals: MarketSignal[];
  disclaimer?: string | null;
  warnings?: unknown[];
  request_id?: string | null;
};

export function useGenerateSignalMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<SignalGenerateResponse>(API.app.agents.signalsGenerate, {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agents-dashboard"] });
      void qc.invalidateQueries({ queryKey: ["agent-signals"] });
    },
  });
}

export function useTrackSignalMutation(signalId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch(API.app.agents.signalTrack(signalId), {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent-signal", signalId] });
      void qc.invalidateQueries({ queryKey: ["agent-signals"] });
    },
  });
}

export function useClaimRewardMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: number) =>
      laravelFetch(API.app.agents.rewardClaim(rewardId), {
        method: "POST",
        body: {},
        token: assertToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent-rewards"] });
      void qc.invalidateQueries({ queryKey: ["agents-dashboard"] });
    },
  });
}
