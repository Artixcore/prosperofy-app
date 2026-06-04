"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type { PAAnalysisRequest, PAAnalysisResponse } from "@/types/pa";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export type PaVersionPayload = {
  model: string;
  engine_version: string;
  status: string;
};

export function usePaVersionQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["pa-version"],
    queryFn: () =>
      laravelFetch<PaVersionPayload>(API.app.pa.version, {
        token: assertToken(token),
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 300_000,
    retry: 1,
  });
}

export function usePaAnalyzeMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: PAAnalysisRequest) =>
      laravelFetch<PAAnalysisResponse>(API.app.pa.analyze, {
        method: "POST",
        body,
        token: assertToken(token),
        timeoutMs: 15_000,
      }),
    retry: false,
  });
}
