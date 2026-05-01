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
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { formatChainName, formatWalletProvider, shortenAddress } from "@/lib/formatters";
import { useToast } from "@/components/system/toast-context";

export default function WalletPage() {
  const { pushToast } = useToast();
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
            challenge_id: body.challenge_id,
          }),
      );
      setMessage("Phantom wallet connected successfully.");
      pushToast({ tone: "success", title: "Wallet connected", description: "Phantom wallet connected successfully." });
    } catch (e) {
      setError(normalizeApiError(e));
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
            challenge_id: body.challenge_id,
          }),
      );
      setMessage("MetaMask wallet connected successfully.");
      pushToast({ tone: "success", title: "Wallet connected", description: "MetaMask wallet connected successfully." });
    } catch (e) {
      setError(normalizeApiError(e));
    }
  }

  async function handleCreateWallet() {
    setError(null);
    setMessage(null);
    try {
      await createWflWallet.mutateAsync();
      setMessage("WFL Wallet is ready.");
      pushToast({ tone: "success", title: "WFL Wallet created", description: "Your wallet is now ready to use." });
    } catch (e) {
      setError(normalizeApiError(e));
    }
  }

  return (
    <>
      <PageHeader title="Wallet" description="Manage connected wallets and your internal WFL Wallet." />
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      {message ? <InlineAlert tone="success">{message}</InlineAlert> : null}
      <p className="mb-4 text-sm text-content-muted">
        Prosperofy encrypts wallet secrets. Keep your recovery backup safe.
      </p>
      <div className="mb-6 grid gap-2 sm:flex sm:flex-wrap">
        <button type="button" className="rounded-md bg-accent px-3 py-2 text-sm text-white disabled:opacity-60" onClick={() => void handleConnectPhantom()} disabled={connect.isPending || challenge.isPending}>Connect Phantom</button>
        <button type="button" className="rounded-md border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised disabled:opacity-60" onClick={() => void handleConnectMetaMask()} disabled={connect.isPending || challenge.isPending}>Connect MetaMask</button>
        <button type="button" className="rounded-md border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised disabled:opacity-60" onClick={() => void handleCreateWallet()} disabled={createWflWallet.isPending}>{createWflWallet.isPending ? "Creating..." : "Create WFL Wallet"}</button>
        <Link href="/wallet/assets" className="rounded-md border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised">View Assets</Link>
        <Link href="/wallet/settings" className="rounded-md border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised">Manage Wallets</Link>
      </div>
      {overview.isPending ? <LoadingState /> : null}
      {overview.isError ? <ErrorState error={overview.error} onRetry={() => void overview.refetch()} /> : null}
      {overview.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
            <h3 className="mb-2 text-sm font-semibold text-content-primary">WFL Wallet</h3>
            <p className="text-sm text-content-muted">{overview.data.wfl_wallet?.status ?? "No WFL Wallet yet"}</p>
            <div className="mt-3 space-y-1 text-xs text-content-muted">
              <p>Solana: {overview.data.wfl_wallet?.public_solana_address ? shortenAddress(overview.data.wfl_wallet.public_solana_address) : "Not available"}</p>
              <p>Ethereum: {overview.data.wfl_wallet?.public_ethereum_address ? shortenAddress(overview.data.wfl_wallet.public_ethereum_address) : "Not available"}</p>
              <p>Bitcoin: {overview.data.wfl_wallet?.public_bitcoin_address ? shortenAddress(overview.data.wfl_wallet.public_bitcoin_address) : "Not available"}</p>
            </div>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
            <h3 className="mb-2 text-sm font-semibold text-content-primary">Connected Wallets</h3>
            {overview.data.connected_wallets.length === 0 ? (
              <p className="text-sm text-content-muted">No external wallets connected.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {overview.data.connected_wallets.map((wallet) => (
                  <li key={wallet.id} className="rounded-lg border border-surface-border bg-surface px-3 py-2">
                    <p className="font-medium text-content-primary">{formatWalletProvider(wallet.provider)}</p>
                    <p className="text-xs text-content-muted">{formatChainName(wallet.chain_type)} • {shortenAddress(wallet.address, 6)}</p>
                    <p className="mt-1 text-xs text-content-muted">
                      {wallet.last_verified_at ? `Verified ${new Date(wallet.last_verified_at).toLocaleString()}` : "Verification pending"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-elevated p-4 md:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-content-primary">Supported Networks</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {(overview.data.supported_chains ?? []).map((chain) => (
                <span key={chain} className="rounded-full border border-surface-border px-2 py-1">
                  {formatChainName(chain)}
                </span>
              ))}
              <span className="rounded-full border border-surface-border px-2 py-1">SPL tokens</span>
              <span className="rounded-full border border-surface-border px-2 py-1">ERC-20 tokens</span>
            </div>
            {overview.data.recent_activity.length === 0 ? (
              <InlineAlert tone="info">No recent wallet activity found yet.</InlineAlert>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
