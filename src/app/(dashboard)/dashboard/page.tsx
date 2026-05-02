"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { formatChainName, formatWalletProvider } from "@/lib/formatters";
import {
  useAppWalletOverviewQuery,
  useCreateWflWalletMutation,
} from "@/features/wallets/use-wallet-mutations";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
      <h2 className="text-base font-semibold text-content-primary">{title}</h2>
      {description ? <p className="mt-1 text-sm text-content-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DashboardHomePage() {
  const walletOverview = useAppWalletOverviewQuery();
  const createWflWallet = useCreateWflWalletMutation();
  const { pushToast } = useToast();

  async function handleCreateWallet() {
    try {
      await createWflWallet.mutateAsync();
      pushToast({
        tone: "success",
        title: "WFL Wallet created",
        description: "Your wallet summary has been refreshed.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Wallet creation failed",
        description: normalizeApiError(error),
      });
    }
  }

  if (walletOverview.isPending) {
    return <LoadingState label="Loading your wallet dashboard..." />;
  }

  const data = walletOverview.data;
  const wflWallet = data?.wfl_wallet;
  const connectedWallets = data?.connected_wallets ?? [];
  const activity = data?.recent_activity ?? [];

  return (
    <div className="space-y-5">
      {walletOverview.isError ? (
        <ErrorState
          error={walletOverview.error}
          title="Dashboard data unavailable"
          onRetry={() => void walletOverview.refetch()}
        />
      ) : null}

      <section className="rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-content-muted">Wallet Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-content-primary">Welcome back to Prosperofy</h1>
            <p className="mt-1 text-sm text-content-muted">
              Monitor WFL status, connected wallets, assets, and wallet activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/wallet" className="rounded-xl border border-surface-border px-3 py-2 text-sm text-content-primary hover:bg-surface-raised">
              View Wallets
            </Link>
            <button
              className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void handleCreateWallet()}
              disabled={createWflWallet.isPending}
            >
              {createWflWallet.isPending ? "Creating..." : "Create WFL Wallet"}
            </button>
          </div>
        </div>
      </section>

      {!data ? <InlineAlert>Wallet data is not available right now.</InlineAlert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Total Balance" description="Fiat valuation is not provided by current API.">
          <p className="text-3xl font-semibold text-content-primary">Balance unavailable</p>
          <p className="mt-2 text-sm text-content-muted">Use Assets to view per-token balances.</p>
        </Card>

        <Card title="WFL Wallet Status" description="Internal wallet managed by Laravel core.">
          <p className="text-2xl font-semibold text-content-primary">{wflWallet?.status ?? "No WFL Wallet yet"}</p>
          <p className="mt-2 text-sm text-content-muted">
            Supported chains: {data?.supported_chains?.map((chain) => formatChainName(chain)).join(", ") ?? "Not available"}
          </p>
        </Card>

        <Card title="Connected Wallets" description="External wallet connections verified by challenge signatures.">
          <p className="text-3xl font-semibold text-content-primary">{connectedWallets.length}</p>
          <p className="mt-2 text-sm text-content-muted">
            {connectedWallets.length === 0 ? "No external wallets connected." : "Connections are ready."}
          </p>
        </Card>

        <Card title="Assets" description="Token list from /api/app/wallet/assets.">
          <p className="text-sm text-content-muted">
            View token balances and network details from your wallet assets page.
          </p>
          <Link
            href="/wallet/assets"
            className="mt-3 inline-flex rounded-lg border border-surface-border px-3 py-2 text-sm text-content-primary hover:bg-surface-raised"
          >
            View Assets
          </Link>
        </Card>

        <Card title="Recent Activity" description="Last wallet activity records from Laravel.">
          {activity.length === 0 ? (
            <p className="text-sm text-content-muted">No wallet activity found yet.</p>
          ) : (
            <ul className="space-y-2">
              {activity.slice(0, 4).map((item) => (
                <li key={item.id} className="rounded-lg border border-surface-border bg-surface px-3 py-2">
                  <p className="text-sm font-medium text-content-primary">{item.action}</p>
                  <p className="text-xs text-content-muted">
                    {formatChainName(item.chain)} • {new Date(item.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/wallet/activity" className="mt-3 inline-flex rounded-lg border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised">
            View Activity
          </Link>
        </Card>

        <Card title="Security Status" description="No private keys or seed phrases are exposed in UI.">
          <div className="rounded-lg border border-emerald-300/50 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-900 dark:text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Protected session and scoped wallet access
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            <Link href="/wallet" className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised">
              <Wallet className="h-4 w-4" />
              Open Wallet
            </Link>
            <Link href="/analysis" className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm hover:bg-surface-raised">
              <CreditCard className="h-4 w-4" />
              Open Agents
            </Link>
          </div>
        </Card>
      </div>

      {connectedWallets.length > 0 ? (
        <Card title="Wallet Connections" description="Providers currently linked to your account.">
          <div className="grid gap-2 md:grid-cols-2">
            {connectedWallets.map((wallet) => (
              <div key={wallet.id} className="rounded-xl border border-surface-border bg-surface-raised p-3">
                <p className="text-sm font-semibold text-content-primary">{formatWalletProvider(wallet.provider)}</p>
                <p className="text-xs text-content-muted">{formatChainName(wallet.chain_type)}</p>
                <p className="mt-2 break-all text-xs font-mono text-content-primary">{wallet.address}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      {connectedWallets.length === 0 ? (
        <InlineAlert tone="info">
          No external wallets connected. Use the wallet page to connect Phantom or MetaMask.
        </InlineAlert>
      ) : null}
      {createWflWallet.isError ? (
        <InlineAlert tone="error">{normalizeApiError(createWflWallet.error)}</InlineAlert>
      ) : null}
      {!wflWallet ? (
        <InlineAlert tone="warning">No WFL Wallet yet. Create one to enable internal wallet features.</InlineAlert>
      ) : null}
    </div>
  );
}
