"use client";

import { InlineAlert } from "@/components/system/inline-alert";
import { MarketQuoteCard, MarketQuoteCardSkeleton } from "@/components/market/market-quote-card";
import { formatUpdatedAt } from "@/components/market/market-chart-utils";
import { isMarketRetryableError } from "@/components/market/market-retry";
import { useMarketQuotes } from "@/features/market/use-market-quotes";
import { normalizeMarketDataError } from "@/lib/api/normalize-api-error";

type Props = {
  symbols: readonly string[];
  assetClass?: string;
};

export function MarketOverviewSection({ symbols, assetClass = "crypto" }: Props) {
  const quotesQ = useMarketQuotes(assetClass, [...symbols]);
  const quoteErr = quotesQ.isError ? normalizeMarketDataError(quotesQ.error) : null;

  return (
    <section className="w-full min-w-0 max-w-full space-y-4">
      <div>
        <h2 className="text-base font-semibold">Market overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Live prices for major crypto assets.</p>
      </div>

      {quoteErr ? (
        <InlineAlert tone="error">
          <div className="flex flex-wrap items-center gap-3">
            <span>{quoteErr}</span>
            {isMarketRetryableError(quotesQ.error) ? (
              <button
                type="button"
                className="text-sm font-medium underline"
                onClick={() => void quotesQ.refetch()}
              >
                Retry
              </button>
            ) : null}
          </div>
        </InlineAlert>
      ) : null}

      {quotesQ.isLoading ? (
        <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {symbols.map((sym) => (
            <MarketQuoteCardSkeleton key={sym} />
          ))}
        </div>
      ) : null}

      {!quotesQ.isLoading && quotesQ.data && quotesQ.data.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            Last updated {formatUpdatedAt(quotesQ.dataUpdatedAt)}
          </p>
          <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotesQ.data.map((row, index) => (
              <MarketQuoteCard key={row.symbol ?? `quote-${index}`} row={row} />
            ))}
          </div>
        </>
      ) : null}

      {!quotesQ.isLoading && !quoteErr && (!quotesQ.data || quotesQ.data.length === 0) ? (
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load market data right now. Please try again.
        </p>
      ) : null}
    </section>
  );
}
