"use client";

import { Check, Plus, Unplug } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { connectMetaMaskFlow, connectPhantomFlow } from "@/features/wallets/wallet-adapters";
import {
  metaMaskWallet,
  phantomWallet,
} from "@/features/wallets/wallet-derive";
import {
  useAppWalletChallengeMutation,
  useAppWalletConnectMutation,
  useDisconnectConnectedWalletMutation,
} from "@/features/wallets/use-wallet-mutations";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { ConnectedWallet, WalletOverview } from "@/lib/api/types";
import { formatChainName, shortenAddress } from "@/lib/formatters";

type Props = {
  overview: WalletOverview | null | undefined;
};

/**
 * Two side-by-side cards for the supported external providers (Phantom for
 * Solana, MetaMask for Ethereum). Each card is fully state-aware: when no
 * wallet of that provider is connected we show a Connect button; when one is
 * connected we show its address and a Disconnect button. Connect/disconnect
 * always invalidates the wallet overview query so the UI flips immediately.
 */
export function ConnectedWalletsSection({ overview }: Props) {
  const phantom = phantomWallet(overview);
  const metamask = metaMaskWallet(overview);
  const [error, setError] = useState<string | null>(null);

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft"
      aria-label="Connected wallets"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-content-primary">
            Connected wallets
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Link external Solana or Ethereum wallets to send and receive on those networks.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <InlineAlert tone="error">{error}</InlineAlert>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ProviderCard
          provider="phantom"
          chain="solana"
          connected={phantom}
          accent="primary"
          onError={setError}
        />
        <ProviderCard
          provider="metamask"
          chain="ethereum"
          connected={metamask}
          accent="outline"
          onError={setError}
        />
      </div>
    </section>
  );
}

type ProviderProps = {
  provider: "phantom" | "metamask";
  chain: "solana" | "ethereum";
  connected: ConnectedWallet | null;
  accent: "primary" | "outline";
  onError: (message: string | null) => void;
};

function ProviderCard({ provider, chain, connected, accent, onError }: ProviderProps) {
  const challenge = useAppWalletChallengeMutation();
  const connect = useAppWalletConnectMutation();
  const disconnect = useDisconnectConnectedWalletMutation();
  const { pushToast } = useToast();

  const label = provider === "phantom" ? "Phantom" : "MetaMask";
  const chainLabel = formatChainName(chain);
  const Icon = provider === "phantom" ? PhantomGlyph : MetaMaskGlyph;
  const busy = challenge.isPending || connect.isPending;

  async function handleConnect() {
    onError(null);
    try {
      if (provider === "phantom") {
        await connectPhantomFlow(
          (body) => challenge.mutateAsync(body),
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
      } else {
        await connectMetaMaskFlow(
          (body) => challenge.mutateAsync(body),
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
      }
      pushToast({
        tone: "success",
        title: `${label} connected`,
        description: `${label} wallet is now linked to your account.`,
      });
    } catch (e) {
      onError(normalizeApiError(e));
    }
  }

  async function handleDisconnect() {
    if (!connected) return;
    onError(null);
    try {
      await disconnect.mutateAsync(connected.id);
      pushToast({
        tone: "success",
        title: `${label} removed`,
        description: "Wallet disconnected successfully.",
      });
    } catch (e) {
      onError(normalizeApiError(e));
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-content-primary">
            <Icon />
          </div>
          <div>
            <p className="text-sm font-semibold text-content-primary">{label}</p>
            <p className="text-xs text-muted-foreground">{chainLabel}</p>
          </div>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/55 dark:bg-emerald-950/35 dark:text-emerald-200">
            <Check className="h-3 w-3" aria-hidden /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Not connected
          </span>
        )}
      </div>

      {connected ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Address</p>
          <code className="mt-1 block break-all font-mono text-xs text-content-primary">
            {shortenAddress(connected.address, 6)}
          </code>
          {connected.last_verified_at ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Verified{" "}
              {new Date(connected.last_verified_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-1">
        {connected ? (
          <ConfirmDialog
            title={`Remove ${label} wallet?`}
            description="This wallet will no longer be linked to your Prosperofy account. Your WFL Wallet is unaffected."
            confirmLabel="Remove"
            tone="danger"
            onConfirm={handleDisconnect}
          >
            {(open) => (
              <button
                type="button"
                onClick={open}
                disabled={disconnect.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-content-primary hover:bg-muted disabled:opacity-60"
              >
                <Unplug className="h-4 w-4" aria-hidden />{" "}
                {disconnect.isPending ? "Removing…" : `Remove ${label}`}
              </button>
            )}
          </ConfirmDialog>
        ) : (
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={busy}
            className={
              accent === "primary"
                ? "inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground motion-safe:transition-[filter] hover:brightness-110 disabled:opacity-60"
                : "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-content-primary hover:bg-muted disabled:opacity-60"
            }
          >
            <Plus className="h-4 w-4" aria-hidden />{" "}
            {busy ? "Connecting…" : `Connect ${label}`}
          </button>
        )}
      </div>
    </div>
  );
}

function PhantomGlyph(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-9 9 8 8 0 0 0 8 8c.6 0 1.1-.5 1.1-1.1 0-.4-.2-.8-.5-1-.3-.2-.6-.5-.6-.9 0-.5.5-.9 1-.9h1.2c2.6 0 4.8-2.1 4.8-4.7V12c0-5-4-9-9-9zm-3 9a1.2 1.2 0 1 1 0-2.4A1.2 1.2 0 0 1 9 12zm6 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />
    </svg>
  );
}

function MetaMaskGlyph(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 6.5 9 4l1 4-1.5 1.5L3 6.5z" strokeLinejoin="round" />
      <path d="M21 6.5 15 4l-1 4 1.5 1.5L21 6.5z" strokeLinejoin="round" />
      <path d="m6 14 1.5 3.5L9 19h6l1.5-1.5L18 14l-2-2H8l-2 2z" strokeLinejoin="round" />
      <path d="M9 19v1.5h6V19" />
    </svg>
  );
}
