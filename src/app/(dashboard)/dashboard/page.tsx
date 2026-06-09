"use client";

import Link from "next/link";
import { ShieldCheck, Wallet } from "lucide-react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { formatChainName, shortenAddress } from "@/lib/formatters";
import {
  useAppWalletOverviewQuery,
  useCreateWflWalletMutation,
} from "@/features/wallets/use-wallet-mutations";
import { primaryWalletAddress } from "@/features/wallets/wallet-derive";
import { useMarketQuote } from "@/features/market/use-market-quote";
import { DashboardBinancePortfolioCard } from "@/components/dashboard/dashboard-binance-portfolio-card";
import { ActivityFeedItem } from "@/components/activity/activity-feed-item";

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
  const btcQuote = useMarketQuote("crypto", "BTCUSD");
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
  const activity = data?.recent_activity ?? [];
  const primaryAddress = primaryWalletAddress(data);

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
              Monitor your WFL wallet, assets, and recent activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/wallet" className="rounded-xl border border-surface-border px-3 py-2 text-sm text-content-primary hover:bg-surface-raised">
              View Wallet
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
        <Card title="Total Balance" description="Fiat valuation is not available yet.">
          <p className="text-3xl font-semibold text-content-primary">Balance unavailable</p>
          <p className="mt-2 text-sm text-content-muted">View Assets to see your token balances.</p>
        </Card>

        <Card title="WFL Wallet Status" description="Your Prosperofy-managed wallet.">
          <p className="text-2xl font-semibold text-content-primary">{wflWallet?.status ?? "No WFL Wallet yet"}</p>
          <p className="mt-2 text-sm text-content-muted">
            Supported chains: {data?.supported_chains?.map((chain) => formatChainName(chain)).join(", ") ?? "Not available"}
          </p>
          {primaryAddress ? (
            <p className="mt-2 font-mono text-xs text-content-muted">
              {formatChainName(primaryAddress.network)}: {shortenAddress(primaryAddress.address, 6)}
            </p>
          ) : null}
        </Card>

        <Card title="BTC snapshot" description="Live spot quote for Bitcoin.">
          {btcQuote.isPending ? (
            <p className="text-sm text-content-muted">Loading market data…</p>
          ) : btcQuote.isError ? (
            <p className="text-sm text-content-muted">Market data unavailable.</p>
          ) : btcQuote.data ? (
            <div className="space-y-2">
              <p className="text-2xl font-semibold tabular-nums text-content-primary">
                {btcQuote.data.mid ?? btcQuote.data.last ?? "—"}{" "}
                <span className="text-sm font-normal text-content-muted">USD (mid)</span>
              </p>
              <p className="text-xs text-content-muted">
                <span className="rounded-md bg-surface px-2 py-0.5">
                  {btcQuote.data.is_live ? "live" : "cached"}
                </span>
                <span className="mx-2">·</span>
                <span>{btcQuote.data.provider ?? "tradewatch"}</span>
                {btcQuote.data.timestamp ? (
                  <>
                    <span className="mx-2">·</span>
                    <span>{btcQuote.data.timestamp}</span>
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="text-sm text-content-muted">No quote returned.</p>
          )}
        </Card>

        <Card title="Assets" description="Token balances across your wallets.">
          <p className="text-sm text-content-muted">
            View token balances and network details on your assets page.
          </p>
          <Link
            href="/wallet/assets"
            className="mt-3 inline-flex rounded-lg border border-surface-border px-3 py-2 text-sm text-content-primary hover:bg-surface-raised"
          >
            View Assets
          </Link>
        </Card>

        <Card title="Recent Activity" description="Your latest wallet and account activity.">
          {activity.length === 0 ? (
            <p className="text-sm text-content-muted">No activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {activity.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <ActivityFeedItem
                    action={item.action}
                    chain={item.chain}
                    created_at={item.created_at}
                    compact
                  />
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
          </div>
        </Card>

        <div className="sm:col-span-2 xl:col-span-3">
          <DashboardBinancePortfolioCard />
        </div>
      </div>

      {createWflWallet.isError ? (
        <InlineAlert tone="error">{normalizeApiError(createWflWallet.error)}</InlineAlert>
      ) : null}
      {!wflWallet ? (
        <InlineAlert tone="warning">No WFL Wallet yet. Create one to enable internal wallet features.</InlineAlert>
      ) : null}
    </div>
  );
}
