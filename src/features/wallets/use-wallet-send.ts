"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  WalletOnChainTransactionRow,
  WalletReceiveAddressRow,
  WalletSendConfirmPayload,
  WalletSendPreviewPayload,
} from "@/lib/api/types";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useReceiveAddressesQuery() {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["wallet-receive-addresses", token],
    queryFn: () =>
      laravelFetch<{ addresses: WalletReceiveAddressRow[] }>(
        API.app.wallet.receiveAddresses,
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: 1,
  });
}

export type SendPreviewBody = {
  network: string;
  asset_type: string;
  symbol: string;
  token_address?: string | null;
  to_address: string;
  amount: string;
};

export function useSendPreviewMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendPreviewBody) =>
      laravelFetch<WalletSendPreviewPayload>(API.app.wallet.sendPreview, {
        method: "POST",
        body,
        token: assertToken(token),
      }),
    retry: false,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

export type SendConfirmBody = {
  preview_id: string;
  idempotency_key: string;
  passphrase?: string;
  two_factor_code?: string;
  current_password?: string;
};

export function useSendConfirmMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendConfirmBody) =>
      laravelFetch<WalletSendConfirmPayload>(API.app.wallet.sendConfirm, {
        method: "POST",
        body,
        token: assertToken(token),
        idempotencyKey: body.idempotency_key,
        timeoutMs: 30_000,
      }),
    retry: false,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
      void qc.invalidateQueries({ queryKey: ["app-wallet-overview"] });
      void qc.invalidateQueries({ queryKey: ["app-wallet-assets"] });
    },
  });
}

export type WalletTransactionsFilters = {
  network?: string;
  type?: string;
  status?: string;
  page?: number;
  per_page?: number;
};

export function useWalletTransactionsQuery(filters: WalletTransactionsFilters = {}) {
  const { token, authReady, isAuthenticated } = useAuth();
  const params = new URLSearchParams();
  if (filters.network) params.set("network", filters.network);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));
  const qs = params.toString();
  const path =
    qs === "" ? API.app.wallet.transactions : `${API.app.wallet.transactions}?${qs}`;

  return useQuery({
    queryKey: ["wallet-transactions", token, filters],
    queryFn: () =>
      laravelFetch<{
        transactions?: WalletOnChainTransactionRow[];
        items?: WalletOnChainTransactionRow[];
        pagination: {
          total: number;
          per_page: number;
          current_page: number;
          last_page: number;
        };
      }>(path, { token }).then((data) => ({
        transactions: data.transactions ?? data.items ?? [],
        pagination: data.pagination,
      })),
    enabled: Boolean(authReady && isAuthenticated && token),
    retry: false,
  });
}

export function useWalletTransactionsSyncMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      laravelFetch<{ synced_count: number; not_implemented: boolean }>(
        API.app.wallet.transactionsSync,
        { method: "POST", body: {}, token: assertToken(token) },
      ),
    retry: false,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
      void qc.invalidateQueries({ queryKey: ["app-wallet-overview"] });
    },
  });
}

export function useWalletTransactionQuery(id: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["wallet-transaction", id, token],
    queryFn: () =>
      laravelFetch<{ transaction: WalletOnChainTransactionRow }>(
        API.app.wallet.transaction(id!),
        { token },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && id),
    refetchInterval: (query) => {
      const s = query.state.data?.transaction?.status;
      if (s === "broadcasted" || s === "pending" || s === "previewed") return 5000;
      return false;
    },
    retry: false,
  });
}

export function useCancelWalletTransactionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      laravelFetch(API.app.wallet.transactionCancel(id), {
        method: "POST",
        body: {},
        token: assertToken(token),
      }),
    retry: false,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
      void qc.invalidateQueries({ queryKey: ["wallet-transaction"] });
    },
  });
}
