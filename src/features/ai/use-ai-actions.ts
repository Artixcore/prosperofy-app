"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  AiRecommendationsListResponse,
  CreateAiActionBody,
  CreateAiActionResponse,
  AiRecommendationRecord,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

type ListParams = {
  page?: number;
  perPage?: number;
  status?: string;
};

function buildRecommendationsPath(params?: ListParams): string {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.perPage) q.set("per_page", String(params.perPage));
  if (params?.status) q.set("status", params.status);
  const query = q.toString();
  return query ? `${API.app.ai.recommendations}?${query}` : API.app.ai.recommendations;
}

export function useAiRecommendationsQuery(params?: ListParams) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["ai-recommendations", token, params?.page, params?.perPage, params?.status],
    queryFn: () =>
      laravelFetch<AiRecommendationsListResponse>(buildRecommendationsPath(params), { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    refetchOnWindowFocus: false,
  });
}

export function useCreateAiActionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAiActionBody) =>
      laravelFetch<CreateAiActionResponse>(API.app.ai.createAction, {
        method: "POST",
        token,
        body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}

export function useSaveAiRecommendationMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      laravelFetch<{ recommendation: AiRecommendationRecord }>(API.app.ai.save(id), {
        method: "POST",
        token,
        body: {},
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}

export function useDismissAiRecommendationMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      laravelFetch<{ recommendation: AiRecommendationRecord }>(API.app.ai.dismiss(id), {
        method: "POST",
        token,
        body: {},
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}
