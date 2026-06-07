"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  BinanceValidationPreview,
  ExchangeConnectionMode,
  ExchangeConnectionSummary,
  ExchangeConnectionsListData,
  ExchangePortfolioResponse,
} from "@/lib/api/types";
import type { IdentityFactors } from "@/features/app/use-settings-security";
import { useAuth } from "@/lib/auth/session-context";

export type BinanceConnectionBody = {
  label?: string | null;
  api_key: string;
  api_secret: string;
  mode: ExchangeConnectionMode;
  accepted_terms: boolean;
  trading_risk_ack?: boolean;
} & IdentityFactors;

export function useExchangeConnectionsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["exchange-connections", token],
    queryFn: () =>
      laravelFetch<ExchangeConnectionsListData>(API.app.settingsExchangeConnections, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
  });
}

export function useValidateBinanceConnectionMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Omit<BinanceConnectionBody, keyof IdentityFactors | "trading_risk_ack">) =>
      laravelFetch<BinanceValidationPreview>(API.app.settingsBinanceValidate, {
        method: "POST",
        body,
        token,
      }),
  });
}

export function useStoreBinanceConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BinanceConnectionBody) =>
      laravelFetch<{ connection: ExchangeConnectionSummary }>(API.app.settingsBinanceStore, {
        method: "POST",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-connections"] });
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      qc.invalidateQueries({ queryKey: ["exchange-portfolio"] });
    },
  });
}

export function useDeleteExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: IdentityFactors }) =>
      laravelFetch<Record<string, never>>(API.app.settingsExchangeConnection(args.id), {
        method: "DELETE",
        body: args.body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-connections"] });
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      qc.invalidateQueries({ queryKey: ["exchange-portfolio"] });
    },
  });
}

export function useRevalidateExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      laravelFetch<{
        connection: ExchangeConnectionSummary;
        binance?: {
          uid?: string | null;
          account_type?: string | null;
          permissions?: string[];
          can_trade?: boolean;
          can_withdraw?: boolean;
          can_deposit?: boolean | null;
        };
        verified: boolean;
      }>(API.app.settingsExchangeConnectionRevalidate(id), { method: "POST", body: {}, token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-connections"] });
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      qc.invalidateQueries({ queryKey: ["exchange-portfolio"] });
    },
  });
}

export function useExchangePortfolioQuery(connectionId: string | null | undefined) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["exchange-portfolio", connectionId, token],
    queryFn: () =>
      laravelFetch<ExchangePortfolioResponse>(
        API.app.settingsExchangePortfolio(connectionId!),
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && connectionId),
  });
}
