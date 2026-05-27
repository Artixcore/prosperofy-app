"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type { PAAnalysisResponse, PAHistoryListResponse } from "@/types/pa";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function usePaHistoryQuery(page = 1) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["pa-history", page],
    queryFn: () =>
      laravelFetch<PAHistoryListResponse>(`${API.app.pa.history}?page=${page}`, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 30_000,
  });
}

export function usePaHistoryDetailQuery(id: string | number | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["pa-history-detail", id],
    queryFn: () =>
      laravelFetch<{ analysis: PAAnalysisResponse & { id?: number; signal_id?: number } }>(
        API.app.pa.historyDetail(id!),
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && id),
    staleTime: 60_000,
  });
}
