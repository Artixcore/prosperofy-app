"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { isApiClientError } from "@/lib/api/errors";
import type {
  AgentCapabilities,
  AgentMarketAnalysisRecord,
  AgentRunRecord,
  AgentTradeExecutionRecord,
  AgentTradeSuggestionRecord,
  AppListResponse,
  CreateTradeSuggestionBody,
  CreateTradeSuggestionResponse,
  UserAgentCreateBody,
  UserAgentRecord,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";
import { normalizeAgentListResponse, type NormalizedAgentList } from "@/features/agent/normalize-agent-list";

type PaginationParams = { page?: number; perPage?: number };

function addPagination(path: string, params?: PaginationParams): string {
  if (!params?.page && !params?.perPage) return path;
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.perPage) q.set("per_page", String(params.perPage));
  return `${path}?${q.toString()}`;
}

export function useAgentCapabilitiesQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agent-capabilities", token],
    queryFn: () => laravelFetch<AgentCapabilities>(API.app.agents.capabilities, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useAgentsQuery(params?: PaginationParams) {
  const { token, authReady, isAuthenticated } = useAuth();
  const perPage = params?.perPage ?? 20;
  return useQuery({
    queryKey: ["app-agents", token, params?.page, perPage],
    queryFn: async () => {
      const raw = await laravelFetch<AppListResponse<UserAgentRecord> | Record<string, unknown>>(
        addPagination(API.app.agents.list, params),
        { token },
      );
      return normalizeAgentListResponse(raw, perPage);
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: (failureCount, error) => {
      if (isApiClientError(error) && error.code === "AGENT_LOAD_FAILED") return false;
      if (isApiClientError(error) && !error.retryable) return false;
      return failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export type { NormalizedAgentList };

export function useAgentQuery(agentId: string) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-agent", agentId, token],
    queryFn: () => laravelFetch<UserAgentRecord>(API.app.agents.show(agentId), { token }),
    enabled: Boolean(authReady && isAuthenticated && token && agentId),
  });
}

export function useCreateAgentMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserAgentCreateBody) =>
      laravelFetch<UserAgentRecord>(API.app.agents.create, { method: "POST", body, token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-agents"] });
    },
  });
}

export function useUpdateAgentMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<UserAgentCreateBody>) =>
      laravelFetch<UserAgentRecord>(API.app.agents.update(agentId), {
        method: "PUT",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-agents"] });
      qc.invalidateQueries({ queryKey: ["app-agent", agentId] });
    },
  });
}

export function useDeleteAgentMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) =>
      laravelFetch<null>(API.app.agents.delete(agentId), { method: "DELETE", token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-agents"] });
    },
  });
}

export function useDisableAgentMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) =>
      laravelFetch<UserAgentRecord>(API.app.agents.disable(agentId), { method: "POST", token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-agents"] });
    },
  });
}

export function useRunAgentMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runType?: string) =>
      laravelFetch<AgentRunRecord>(API.app.agents.run(agentId), {
        method: "POST",
        body: runType ? { run_type: runType } : {},
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-agent", agentId] });
      qc.invalidateQueries({ queryKey: ["app-agents"] });
      qc.invalidateQueries({ queryKey: ["agent-analyses", agentId] });
      qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] });
    },
  });
}

export function useAgentAnalysesQuery(agentId: string) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agent-analyses", agentId, token],
    queryFn: () =>
      laravelFetch<AppListResponse<AgentMarketAnalysisRecord>>(
        addPagination(API.app.agents.analyses(agentId), { perPage: 10 }),
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && agentId),
  });
}

export function useAgentSuggestionsQuery(agentId: string) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agent-suggestions", agentId, token],
    queryFn: () =>
      laravelFetch<AppListResponse<AgentTradeSuggestionRecord>>(
        addPagination(API.app.agents.tradeSuggestions(agentId), { perPage: 20 }),
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && agentId),
  });
}

export function useAgentExecutionsQuery(agentId: string) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["agent-executions", agentId, token],
    queryFn: () =>
      laravelFetch<AppListResponse<AgentTradeExecutionRecord>>(
        addPagination(API.app.agents.tradeExecutions(agentId), { perPage: 20 }),
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && agentId),
  });
}

export function useExplainSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      laravelFetch<AgentTradeSuggestionRecord>(
        API.app.agents.tradeSuggestionExplain(agentId, suggestionId),
        { method: "POST", token },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] }),
  });
}

export function useSaveSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      laravelFetch<{ suggestion: AgentTradeSuggestionRecord }>(
        API.app.agents.tradeSuggestionSave(agentId, suggestionId),
        { method: "POST", token },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] }),
  });
}

export function useCancelSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      laravelFetch<AgentTradeSuggestionRecord>(
        API.app.agents.tradeSuggestionCancel(agentId, suggestionId),
        { method: "POST", token },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] }),
  });
}

export function useExecuteSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      suggestionId: string;
      idempotencyKey: string;
      confirmations: Record<string, boolean>;
    }) =>
      laravelFetch<AgentTradeExecutionRecord>(
        API.app.agents.tradeSuggestionExecute(agentId, params.suggestionId),
        {
          method: "POST",
          body: {
            idempotency_key: params.idempotencyKey,
            confirmations: params.confirmations,
          },
          idempotencyKey: params.idempotencyKey,
          token,
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] });
      qc.invalidateQueries({ queryKey: ["agent-executions", agentId] });
    },
  });
}

function compactTradeSuggestionBody(body: CreateTradeSuggestionBody): CreateTradeSuggestionBody {
  const compact: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      compact[key] = value;
    }
  }
  return compact as CreateTradeSuggestionBody;
}

export function useCreateSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTradeSuggestionBody) =>
      laravelFetch<CreateTradeSuggestionResponse>(API.app.agents.tradeSuggestions(agentId), {
        method: "POST",
        body: compactTradeSuggestionBody(body),
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] }),
  });
}
