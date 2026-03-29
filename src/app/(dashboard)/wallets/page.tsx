"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import {
  useConnectMetaMaskMutation,
  useConnectPhantomMutation,
  useWalletNonceMutation,
  useWalletsQuery,
} from "@/features/wallets/use-wallet-mutations";
import { connectMetaMaskFlow, connectPhantomFlow } from "@/features/wallets/wallet-adapters";

export default function WalletsPage() {
  const { data, isPending, isError, error, refetch } = useWalletsQuery();
  const nonceMutation = useWalletNonceMutation();
  const connectPhantom = useConnectPhantomMutation();
  const connectMetaMask = useConnectMetaMaskMutation();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"phantom" | "metamask" | null>(null);

  async function handlePhantom() {
    setConnectError(null);
    setBusy("phantom");
    try {
      await connectPhantomFlow(
        async (provider) => nonceMutation.mutateAsync(provider),
        async (body) => connectPhantom.mutateAsync(body),
      );
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : "Phantom connect failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleMetaMask() {
    setConnectError(null);
    setBusy("metamask");
    try {
      await connectMetaMaskFlow(
        async (provider) => nonceMutation.mutateAsync(provider),
        async (body) => connectMetaMask.mutateAsync(body),
      );
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : "MetaMask connect failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Wallets"
        description="Nonce and verification go through Laravel, which calls the internal wallet service. Your browser never talks to that service directly."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handlePhantom()}
              className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy === "phantom" ? "Connecting…" : "Connect Phantom"}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handleMetaMask()}
              className="rounded-md border border-surface-border px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-surface-raised disabled:opacity-50"
            >
              {busy === "metamask" ? "Connecting…" : "Connect MetaMask"}
            </button>
          </div>
        }
      />
      {connectError ? <InlineAlert tone="error">{connectError}</InlineAlert> : null}
      {isPending ? <LoadingState /> : null}
      {isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title="No wallets connected"
          description="Connect Phantom (Solana) or MetaMask (EVM) to link an address to your account."
        />
      ) : null}
      {!isPending && !isError && data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((w) => (
            <li key={w.id}>
              <Link
                href={`/wallets/${w.id}`}
                className="flex flex-col rounded-lg border border-surface-border bg-surface-raised/50 px-4 py-3 transition hover:border-zinc-600 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {w.label ?? w.provider}{" "}
                    <span className="text-zinc-500">({w.chain_type})</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-400">{w.address}</p>
                </div>
                <span className="mt-2 text-sm text-accent-muted sm:mt-0">Details →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
