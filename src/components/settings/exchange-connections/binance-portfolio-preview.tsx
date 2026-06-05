"use client";

import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { useExchangePortfolioQuery } from "@/features/exchanges/use-exchange-connections";

export function BinancePortfolioPreview({
  connectionId,
  onRetry,
}: {
  connectionId: string;
  onRetry?: () => void;
}) {
  const portfolio = useExchangePortfolioQuery(connectionId);

  if (portfolio.isPending) {
    return <LoadingState label="Loading Binance portfolio..." />;
  }

  if (portfolio.isError) {
    return (
      <ErrorState
        error={portfolio.error}
        title="Portfolio unavailable"
        onRetry={() => {
          void portfolio.refetch();
          onRetry?.();
        }}
      />
    );
  }

  const data = portfolio.data;
  const balances = data?.balances ?? [];

  if (balances.length === 0) {
    return (
      <InlineAlert tone="info">
        No non-zero balances were returned from Binance. Your account may be empty or only holds
        dust amounts.
      </InlineAlert>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-raised/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Asset</th>
            <th className="px-3 py-2">Free</th>
            <th className="px-3 py-2">Locked</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((row) => (
            <tr key={row.asset} className="border-t border-surface-border">
              <td className="px-3 py-2 font-medium text-foreground">{row.asset}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.free}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.locked}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.valuation_available ? null : (
        <p className="border-t border-surface-border px-3 py-2 text-xs text-muted-foreground">
          Total valuation unavailable — balances shown without USD estimates.
        </p>
      )}
    </div>
  );
}
