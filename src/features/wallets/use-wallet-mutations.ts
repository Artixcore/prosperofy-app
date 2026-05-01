"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import type {
  ConnectedWallet,
  WalletAssetItem,
  WalletChallengeData,
  WalletNonceData,
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

export function useWalletsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["wallets", token],
    queryFn: () =>
      laravelFetch<ConnectedWallet[]>(API.app.wallets.list, {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: false,
  });
}

export function useWalletQuery(id: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["wallet", id, token],
    queryFn: () =>
      laravelFetch<ConnectedWallet>(API.app.wallets.show(id!), {
        token,
      }),
    enabled: Boolean(authReady && isAuthenticated && token && id),
    retry: false,
  });
}

export function useWalletNonceMutation() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useMutation({
    mutationFn: (provider: "phantom" | "metamask") => {
      if (!authReady || !isAuthenticated) {
        throw new ApiClientError("Please sign in again.", {
          status: 401,
          code: "UNAUTHENTICATED",
          retryable: false,
        });
      }
      return laravelFetch<WalletNonceData>(API.app.wallets.nonce, {
        method: "POST",
        body: { provider },
        token: assertAuthenticatedToken(token),
      });
    },
  });
}

export function useConnectPhantomMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      nonce: string;
      message: string;
      signature: string;
      publicKey: string;
      network?: string;
      label?: string;
    }) =>
      laravelFetch<ConnectedWallet>(API.app.wallets.connectPhantom, {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallets"] });
      void qc.invalidateQueries({ queryKey: ["app-dashboard"] });
    },
  });
}

export function useConnectMetaMaskMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      nonce: string;
      message: string;
      signature: string;
      address: string;
      network?: string;
      label?: string;
    }) =>
      laravelFetch<ConnectedWallet>(API.app.wallets.connectMetaMask, {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallets"] });
      void qc.invalidateQueries({ queryKey: ["app-dashboard"] });
    },
  });
}

export function useBalanceRefreshMutation(walletId: string) {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body?: { network?: string; include_token_balances?: boolean }) =>
      laravelFetch<Record<string, unknown>>(API.app.wallets.balanceRefresh(walletId), {
        method: "POST",
        body: body ?? {},
        token: assertAuthenticatedToken(token),
      }),
  });
}

export function usePrepareTxMutation(walletId: string) {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      laravelFetch<Record<string, unknown>>(API.app.wallets.txPrepare(walletId), {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
  });
}

export function useSimulateTxMutation(walletId: string) {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: { serialized_transaction_base64: string }) =>
      laravelFetch<Record<string, unknown>>(API.app.wallets.txSimulate(walletId), {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
  });
}

export function useBroadcastTxMutation(walletId: string) {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: {
      serialized_transaction_base64: string;
      idempotency_key: string;
    }) =>
      laravelFetch<Record<string, unknown>>(API.app.wallets.txBroadcast(walletId), {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
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

export function useAppWalletAssetsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["app-wallet-assets", token],
    queryFn: () => laravelFetch<WalletAssetItem[]>(API.app.wallet.assets, { token }),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: false,
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

export function useAppWalletChallengeMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: { provider: "phantom" | "metamask"; chain: "solana" | "ethereum"; address?: string; publicKey?: string }) =>
      laravelFetch<WalletChallengeData>(API.app.wallet.challenge, {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
  });
}

export function useAppWalletConnectMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      provider: "phantom" | "metamask";
      chain: "solana" | "ethereum";
      signature: string;
      message: string;
      challenge_id: number;
      publicKey?: string;
      address?: string;
    }) =>
      laravelFetch<Record<string, unknown>>(API.app.wallet.connect, {
        method: "POST",
        body,
        token: assertAuthenticatedToken(token),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["app-wallet-overview"] });
    },
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
