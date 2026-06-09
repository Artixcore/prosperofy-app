"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type {
  WalletAssetsListPayload,
  WalletAssetsRefreshPayload,
  WalletSummaryPayload,
  WalletOverview,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

function assertAuthenticatedToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useAppWalletOverviewQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-wallet-overview", token],
    queryFn: () => laravelFetch<WalletOverview>(API.app.wallet.overview, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: false,
  });
}

export function useAppWalletSummaryQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-wallet-summary", token],
    queryFn: () => laravelFetch<WalletSummaryPayload>(API.app.wallet.summary, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: 1,
  });
}

export function useAppWalletAssetsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-wallet-assets", token],
    queryFn: () => laravelFetch<WalletAssetsListPayload>(API.app.wallet.assets, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: 1,
  });
}

export function invalidateWalletQueries(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: ["app-wallet-overview"] });
  void qc.invalidateQueries({ queryKey: ["app-wallet-assets"] });
  void qc.invalidateQueries({ queryKey: ["app-wallet-summary"] });
  void qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
  void qc.invalidateQueries({ queryKey: ["app-dashboard"] });
}

export type WalletTransactionsSyncPayload = {
  synced_count: number;
  not_implemented: boolean;
  balance_refreshed?: boolean;
  wallet?: {
    id: number;
    address: string;
    network: string;
    asset: string;
    balance_lamports: string;
    balance_sol: string;
    last_balance_synced_at: string | null;
  } | null;
  balance_refresh_error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type WalletFullRefreshResult = {
  sync: WalletTransactionsSyncPayload;
  assets: WalletAssetsRefreshPayload;
};

/**
 * Sync on-chain deposits then force-refresh cached balances. Used by the wallet
 * dashboard Refresh control and mount-time auto-sync.
 */
export function useWalletFullRefreshMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<WalletFullRefreshResult> => {
      const authToken = assertAuthenticatedToken(token);
      const sync = await laravelFetch<WalletTransactionsSyncPayload>(
        API.app.wallet.transactionsSync,
        { method: "POST", body: {}, token: authToken },
      );
      const assets = await laravelFetch<WalletAssetsRefreshPayload>(API.app.wallet.assetsRefresh, {
        method: "POST",
        body: { force: true },
        token: authToken,
      });
      return { sync, assets };
    },
    retry: false,
    onSuccess: () => {
      invalidateWalletQueries(qc);
    },
  });
}

/**
 * POST /api/app/wallet/assets/refresh — force a fresh on-chain balance pull
 * via wallet-service. Returns the updated assets list (or a `from_cache: true`
 * marker if a recent sync was reused).
 */
export function useRefreshWalletAssetsMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: { network?: string; force?: boolean }) =>
      laravelFetch<WalletAssetsRefreshPayload>(API.app.wallet.assetsRefresh, {
        method: "POST",
        body: body ?? {},
        token: assertAuthenticatedToken(token),
      }),
    retry: false,
    onSuccess: () => {
      invalidateWalletQueries(qc);
    },
  });
}

export function useAppWalletActivityQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-wallet-activity", token],
    queryFn: () => laravelFetch<Array<Record<string, unknown>>>(API.app.wallet.activity, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: false,
  });
}

export function useCreateWflWalletMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      laravelFetch<Record<string, unknown>>(API.app.wallet.create, {
        method: "POST",
        body: { wallet_type: "wfl_internal" },
        token: assertAuthenticatedToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["app-wallet-overview"] });
      void qc.invalidateQueries({ queryKey: ["app-wallet-assets"] });
    },
  });
}
