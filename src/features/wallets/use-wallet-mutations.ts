"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ConnectedWallet, WalletNonceData } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useWalletsQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["wallets", token],
    queryFn: () =>
      laravelFetch<ConnectedWallet[]>(API.app.wallets.list, {
        token,
      }),
    enabled: Boolean(token),
  });
}

export function useWalletQuery(id: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["wallet", id, token],
    queryFn: () =>
      laravelFetch<ConnectedWallet>(API.app.wallets.show(id!), {
        token,
      }),
    enabled: Boolean(token && id),
  });
}

export function useWalletNonceMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (provider: "phantom" | "metamask") =>
      laravelFetch<WalletNonceData>(API.app.wallets.nonce, {
        method: "POST",
        body: { provider },
        token,
      }),
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
        token,
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
        token,
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
        token,
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
        token,
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
        token,
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
        token,
      }),
  });
}
