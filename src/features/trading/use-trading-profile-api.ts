"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

export type TradingProfile = {
  id: number;
  user_id: number;
  preferred_symbols?: string[] | null;
  preferred_timeframes?: string[] | null;
  risk_preference?: string | null;
  saved_signal_count?: number;
  dismissed_signal_count?: number;
  last_active_symbol?: string | null;
  last_analysis_at?: string | null;
  profile_snapshot?: Record<string, unknown> | null;
};

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useTradingProfileQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["trading-profile"],
    queryFn: async () => {
      const data = await laravelFetch<{ profile: TradingProfile }>(API.app.tradingProfile.show, {
        token: assertToken(token),
      });
      return data.profile;
    },
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 60_000,
  });
}

export function useTradingProfilePreferencesMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      risk_preference?: string;
      preferred_symbols?: string[];
      preferred_timeframes?: string[];
    }) =>
      laravelFetch<{ profile: TradingProfile }>(API.app.tradingProfile.preferences, {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["trading-profile"] });
    },
  });
}
