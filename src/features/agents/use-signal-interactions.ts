"use client";

import { useMutation } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

export type SignalInteractionType =
  | "viewed"
  | "clicked"
  | "opened_details"
  | "saved"
  | "dismissed"
  | "copied_trade_plan"
  | "marked_useful"
  | "marked_not_useful"
  | "run_again";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useSignalInteractionMutation(signalId: number | string) {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (body: {
      interaction_type: SignalInteractionType;
      metadata?: Record<string, unknown>;
      pa_analysis_result_id?: number;
    }) =>
      laravelFetch<Record<string, never>>(API.app.agents.signalInteraction(signalId), {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    retry: false,
  });
}
