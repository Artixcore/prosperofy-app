"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import {
  useAppWalletChallengeMutation,
  useAppWalletConnectMutation,
  useWalletsQuery,
} from "@/features/wallets/use-wallet-mutations";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function WalletsPage() {
  const { data, isPending, isError, error, refetch } = useWalletsQuery();
  const challenge = useAppWalletChallengeMutation();
  const connect = useAppWalletConnectMutation();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"phantom" | "metamask" | null>(null);
  const wallets = Array.isArray(data) ? data : [];
  const hasInvalidDataShape = !isPending && !isError && typeof data !== "undefined" && !Array.isArray(data);

  async function handlePhantom() {
    setConnectError(null);
    setBusy("phantom");
    try {
      const { connectPhantomFlow } = await import("@/features/wallets/wallet-adapters");
      await connectPhantomFlow(
        (challengeBody) => challenge.mutateAsync(challengeBody),
        (body) =>
          connect.mutateAsync({
            provider: "phantom",
            chain: "solana",
            signature: body.signature,
            message: body.message,
            publicKey: body.publicKey,
            challenge_id: body.challenge_id,
          }),
      );
    } catch (e) {
      setConnectError(normalizeApiError(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleMetaMask() {
    setConnectError(null);
    setBusy("metamask");
    try {
      const { connectMetaMaskFlow } = await import("@/features/wallets/wallet-adapters");
      await connectMetaMaskFlow(
        (challengeBody) => challenge.mutateAsync(challengeBody),
        (body) =>
          connect.mutateAsync({
            provider: "metamask",
            chain: "ethereum",
            signature: body.signature,
            message: body.message,
            address: body.address,
            challenge_id: body.challenge_id,
          }),
      );
    } catch (e) {
      setConnectError(normalizeApiError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Wallets"
        description="Challenge and signature verification go through Laravel, which calls the internal wallet service. Your browser never talks to that service directly."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null || connect.isPending || challenge.isPending}
              onClick={() => void handlePhantom()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {busy === "phantom" ? "Connecting…" : "Connect Phantom"}
            </button>
            <button
              type="button"
              disabled={busy !== null || connect.isPending || challenge.isPending}
              onClick={() => void handleMetaMask()}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary disabled:opacity-50"
            >
              {busy === "metamask" ? "Connecting…" : "Connect MetaMask"}
            </button>
          </div>
        }
      />
      {connectError ? <InlineAlert tone="error">{connectError}</InlineAlert> : null}
      {isPending ? <LoadingState /> : null}
      {isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {hasInvalidDataShape ? (
        <ErrorState
          error={new Error("Unexpected wallets response. Please retry.")}
          onRetry={() => void refetch()}
          title="Unable to load wallets"
        />
      ) : null}
      {!isPending && !isError && wallets.length === 0 && !hasInvalidDataShape ? (
        <EmptyState
          title="No wallet connected yet"
          description="Connect Phantom (Solana) or MetaMask (EVM) to link an address to your account."
        />
      ) : null}
      {!isPending && !isError && wallets.length > 0 ? (
        <ul className="space-y-2">
          {wallets.map((w) => (
            <li key={w.id}>
              <Link
                href={`/wallets/${w.id}`}
                className="flex flex-col rounded-lg border border-surface-border bg-surface-raised/50 px-4 py-3 transition hover:border-zinc-600 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {w.label ?? w.provider}{" "}
                    <span className="text-muted-foreground">({w.chain_type})</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{w.address}</p>
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
