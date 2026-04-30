"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  AppListResponse,
  OrchestrationJob,
  StrategyCreateBody,
  StrategyPatchBody,
  StrategyRecord,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

type PaginationParams = {
  perPage?: number;
  page?: number;
};

function addPagination(path: string, params?: PaginationParams): string {
  const query = new URLSearchParams();
  if (params?.perPage) query.set("per_page", String(params.perPage));
  if (params?.page) query.set("page", String(params.page));
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function useStrategiesQuery(params?: PaginationParams) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-strategies", token, params?.perPage, params?.page],
    queryFn: () =>
      laravelFetch<AppListResponse<StrategyRecord>>(addPagination(API.app.strategies.list, params), {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useStrategyQuery(id: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-strategy", id, token],
    queryFn: () =>
      laravelFetch<StrategyRecord>(API.app.strategies.show(id!), {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token && id),
  });
}

export function useCreateStrategyMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StrategyCreateBody) =>
      laravelFetch<StrategyRecord>(API.app.strategies.create, {
        method: "POST",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-strategies"] });
    },
  });
}

export function useUpdateStrategyMutation(id: string) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StrategyPatchBody) =>
      laravelFetch<StrategyRecord>(API.app.strategies.update(id), {
        method: "PATCH",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-strategies"] });
      qc.invalidateQueries({ queryKey: ["app-strategy", id] });
    },
  });
}

export function useStrategyEvaluationsQuery(strategyId: string | null, params?: PaginationParams) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-strategy-evaluations", strategyId, token, params?.perPage, params?.page],
    queryFn: () =>
      laravelFetch<AppListResponse<OrchestrationJob>>(
        addPagination(API.app.strategies.evaluations(strategyId!), params),
        {
          token,
        },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && strategyId),
  });
}
