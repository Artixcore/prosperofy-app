"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LoadingState } from "@/components/system/loading-state";
import { normalizeMarketDataError } from "@/lib/api/normalize-api-error";
import { useMarketCandles } from "@/features/market/use-market-candles";
import {
  buildChartRows,
  CHART_TIMEFRAMES,
  formatUpdatedAt,
  symbolShortLabel,
  type ChartTimeframe,
} from "@/components/market/market-chart-utils";
import { isMarketRetryableError } from "@/components/market/market-retry";

type Props = {
  assetClass?: string;
  symbol: string;
  timeframe: ChartTimeframe;
  symbols: readonly string[];
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
};

export function MarketPriceChart({
  assetClass = "crypto",
  symbol,
  timeframe,
  symbols,
  onSymbolChange,
  onTimeframeChange,
}: Props) {
  const timeframeConfig = CHART_TIMEFRAMES.find((t) => t.id === timeframe) ?? CHART_TIMEFRAMES[0];

  const candleRange = useMemo(() => {
    const toSec = Math.floor(Date.now() / 1000);
    return { fromSec: toSec - timeframeConfig.rangeSec, toSec };
  }, [timeframeConfig.rangeSec]);

  const candlesQ = useMarketCandles(
    assetClass,
    symbol,
    timeframeConfig.resolution,
    candleRange.fromSec,
    candleRange.toSec,
    true,
  );

  const chartData = useMemo(
    () => (candlesQ.data ? buildChartRows(candlesQ.data) : []),
    [candlesQ.data],
  );

  const candleErr = candlesQ.isError ? normalizeMarketDataError(candlesQ.error) : null;

  return (
    <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Price chart</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track recent price movement for the selected asset.
          </p>
          {candlesQ.dataUpdatedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Last updated {formatUpdatedAt(candlesQ.dataUpdatedAt)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {symbols.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => onSymbolChange(sym)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                symbol === sym
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {symbolShortLabel(sym)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHART_TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            type="button"
            onClick={() => onTimeframeChange(tf.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              timeframe === tf.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {candleErr ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-destructive">
          <span>{candleErr}</span>
          {isMarketRetryableError(candlesQ.error) ? (
            <button
              type="button"
              className="font-medium underline"
              onClick={() => void candlesQ.refetch()}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {candlesQ.isLoading ? (
        <LoadingState label="Loading chart…" className="mt-4 !py-8" />
      ) : chartData.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No chart data available yet.</p>
      ) : (
        <div className="mt-4 h-72 min-h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={56} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="close"
                stroke="hsl(var(--primary))"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
