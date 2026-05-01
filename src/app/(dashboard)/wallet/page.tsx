"use client";

import Link from "next/link";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { PageHeader } from "@/components/page-header";
import {
  useAppWalletOverviewQuery,
  useAppWalletChallengeMutation,
  useAppWalletConnectMutation,
  useCreateWflWalletMutation,
} from "@/features/wallets/use-wallet-mutations";
import { connectMetaMaskFlow, connectPhantomFlow } from "@/features/wallets/wallet-adapters";
import { useState } from "react";

export default function WalletPage() {
  const overview = useAppWalletOverviewQuery();
  const challenge = useAppWalletChallengeMutation();
  const connect = useAppWalletConnectMutation();
  const createWflWallet = useCreateWflWalletMutation();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnectPhantom() {
    setError(null);
    setMessage(null);
    try {
      await connectPhantomFlow(
        () => challenge.mutateAsync({ provider: "phantom", chain: "solana" }),
        (body) =>
          connect.mutateAsync({
            provider: "phantom",
            chain: "solana",
            signature: body.signature,
            message: body.message,
            publicKey: body.publicKey,
            challenge_id: Number(body.challenge_id),
          }),
      );
      setMessage("Phantom wallet connected successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect Phantom wallet.");
    }
  }

  async function handleConnectMetaMask() {
    setError(null);
    setMessage(null);
    try {
      await connectMetaMaskFlow(
        () => challenge.mutateAsync({ provider: "metamask", chain: "ethereum" }),
        (body) =>
          connect.mutateAsync({
            provider: "metamask",
            chain: "ethereum",
            signature: body.signature,
            message: body.message,
            address: body.address,
            challenge_id: Number(body.challenge_id),
          }),
      );
      setMessage("MetaMask wallet connected successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect MetaMask wallet.");
    }
  }

  async function handleCreateWallet() {
    setError(null);
    setMessage(null);
    try {
      await createWflWallet.mutateAsync();
      setMessage("WFL Wallet is ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create WFL Wallet.");
    }
  }

  return (
    <>
      <PageHeader title="Wallet" description="Manage connected wallets and your internal WFL Wallet." />
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      {message ? <InlineAlert tone="success">{message}</InlineAlert> : null}
      <p className="mb-4 text-sm text-zinc-400">
        Prosperofy encrypts wallet secrets. Keep your recovery backup safe.
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="rounded-md bg-accent px-3 py-2 text-sm text-white" onClick={() => void handleConnectPhantom()}>Connect Phantom</button>
        <button type="button" className="rounded-md border border-surface-border px-3 py-2 text-sm" onClick={() => void handleConnectMetaMask()}>Connect MetaMask</button>
        <button type="button" className="rounded-md border border-surface-border px-3 py-2 text-sm" onClick={() => void handleCreateWallet()}>Create WFL Wallet</button>
        <Link href="/wallet/assets" className="rounded-md border border-surface-border px-3 py-2 text-sm">View Assets</Link>
        <Link href="/wallet/settings" className="rounded-md border border-surface-border px-3 py-2 text-sm">Manage Wallets</Link>
      </div>
      {overview.isPending ? <LoadingState /> : null}
      {overview.isError ? <ErrorState error={overview.error} onRetry={() => void overview.refetch()} /> : null}
      {overview.data ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-surface-border p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">WFL Wallet status</h3>
            <p className="text-sm text-zinc-400">{overview.data.wfl_wallet?.status ?? "Not created yet"}</p>
          </div>
          <div className="rounded-lg border border-surface-border p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">Connected external wallets</h3>
            {overview.data.connected_wallets.length === 0 ? (
              <p className="text-sm text-zinc-400">No external wallets connected.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {overview.data.connected_wallets.map((wallet) => (
                  <li key={wallet.id} className="rounded border border-surface-border px-3 py-2">
                    {wallet.provider} - {wallet.address}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
