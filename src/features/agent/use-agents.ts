"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  AgentCapabilities,
  AgentMarketAnalysisRecord,
  AgentRunRecord,
  AgentTradeExecutionRecord,
  AgentTradeSuggestionRecord,
  AppListResponse,
  UserAgentCreateBody,
  UserAgentRecord,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

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
  return useQuery({
    queryKey: ["app-agents", token, params?.page, params?.perPage],
    queryFn: () =>
      laravelFetch<AppListResponse<UserAgentRecord>>(addPagination(API.app.agents.list, params), {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: 1,
  });
}

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

export function useCreateSuggestionMutation(agentId: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (symbol?: string) =>
      laravelFetch<AgentTradeSuggestionRecord>(API.app.agents.tradeSuggestions(agentId), {
        method: "POST",
        body: symbol ? { symbol } : {},
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-suggestions", agentId] }),
  });
}
