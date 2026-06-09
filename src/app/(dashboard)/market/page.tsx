"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { normalizeMarketDataError } from "@/lib/api/normalize-api-error";
import { useMarketCandles, type ChartPoint, type CandleBar } from "@/features/market/use-market-candles";
import { useMarketQuotes } from "@/features/market/use-market-quotes";
import { useMarketSymbolsSearch } from "@/features/market/use-market-symbols";
import type { MarketQuotePayload } from "@/features/market/use-market-quote";
import { useNewsMarketQuery } from "@/features/news/use-news-api";
import { NewsPanel } from "@/components/news/news-panel";
import { ApiClientError } from "@/lib/api/errors";

type AssetTab = "crypto" | "forex" | "stock" | "index" | "commodity";

const TAB_DEFAULTS: Record<AssetTab, string[]> = {
  crypto: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  forex: ["EURUSD", "GBPUSD", "USDJPY"],
  stock: ["AAPL", "MSFT"],
  index: ["SPX500", "DJI"],
  commodity: ["XAUUSD", "XAGUSD"],
};

function formatUpdatedAt(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function LiveBadge({ q }: { q: MarketQuotePayload }) {
  const live = Boolean(q.is_live);
  const src = (q.source ?? "").toLowerCase();
  const label = live && src !== "cached" ? "Live / recent" : "Cached or delayed";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        live && src !== "cached"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/15 text-amber-800 dark:text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

function QuoteCard({ row }: { row: MarketQuotePayload }) {
  const label = row.display_symbol || row.symbol || "—";
  const mid = row.mid ?? row.last ?? row.price ?? "—";
  const change =
    row.change_percentage_24h ?? row.change_24h_percent ?? null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{row.symbol}</p>
        </div>
        <LiveBadge q={row} />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{mid}</p>
      {change != null && change !== "" ? (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">24h: {change}%</p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        Signals are informational, not financial advice. Markets involve risk.
      </p>
    </div>
  );
}

function extractSymbolHints(raw: unknown): { symbol: string; name: string }[] {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const candidates = [root.items, root.data, root.symbols];
  let arr: unknown = null;
  for (const c of candidates) {
    if (Array.isArray(c)) {
      arr = c;
      break;
    }
    if (c && typeof c === "object" && Array.isArray((c as { items?: unknown }).items)) {
      arr = (c as { items: unknown[] }).items;
      break;
    }
  }
  if (!Array.isArray(arr)) return [];
  const out: { symbol: string; name: string }[] = [];
  for (const row of arr.slice(0, 24)) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const sym =
      (typeof o.symbol === "string" && o.symbol) ||
      (typeof o.ticker === "string" && o.ticker) ||
      "";
    if (!sym) continue;
    const name =
      (typeof o.name === "string" && o.name) ||
      (typeof o.description === "string" && o.description) ||
      sym;
    out.push({ symbol: sym.toUpperCase(), name });
  }
  return out;
}

function timestampLabel(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value);
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    const ms = n > 1_000_000_000_000 ? n : n * 1000;
    return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
  }
  return raw.slice(0, 16);
}

function buildChartRows(payload: {
  points?: ChartPoint[];
  candles?: CandleBar[];
  items?: CandleBar[];
}): { t: string; close: number }[] {
  const points = payload.points ?? [];
  if (points.length > 0) {
    return points
      .map((p) => {
        const price = p.price != null ? parseFloat(String(p.price)) : NaN;
        const t = timestampLabel(p.timestamp ?? (p.time != null ? p.time * 1000 : null));
        if (!t || Number.isNaN(price)) return null;
        return { t, close: price };
      })
      .filter(Boolean) as { t: string; close: number }[];
  }

  const bars = payload.candles?.length ? payload.candles : (payload.items ?? []);
  return bars
    .map((c) => {
      const ts = timestampLabel(c.timestamp ?? (c.time != null ? c.time * 1000 : null));
      const close = c.close != null ? parseFloat(String(c.close)) : NaN;
      if (!ts || Number.isNaN(close)) return null;
      return { t: ts, close };
    })
    .filter(Boolean) as { t: string; close: number }[];
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.retryable) return true;
    return [500, 502, 503, 504].includes(error.status ?? 0);
  }
  return false;
}

export default function MarketDashboardPage() {
  const [tab, setTab] = useState<AssetTab>("crypto");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const defaults = TAB_DEFAULTS[tab];
  const quotesQ = useMarketQuotes(tab, defaults);

  const chartSymbol = defaults[0] ?? "BTCUSDT";
  const candleRange = useMemo(() => {
    const toSec = Math.floor(Date.now() / 1000);
    return { fromSec: toSec - 86400 * 7, toSec, symbol: chartSymbol };
  }, [chartSymbol]);
  const candlesQ = useMarketCandles(
    tab,
    chartSymbol,
    "1h",
    candleRange.fromSec,
    candleRange.toSec,
    true,
  );

  const symSearch = useMarketSymbolsSearch(tab, debouncedSearch, debouncedSearch.length >= 1);
  const searchRows = useMemo(
    () => extractSymbolHints(symSearch.data),
    [symSearch.data],
  );

  const chartData = useMemo(
    () => (candlesQ.data ? buildChartRows(candlesQ.data) : []),
    [candlesQ.data],
  );

  const quoteErr = quotesQ.isError ? normalizeMarketDataError(quotesQ.error) : null;
  const candleErr = candlesQ.isError ? normalizeMarketDataError(candlesQ.error) : null;
  const marketNews = useNewsMarketQuery("global markets");
  const newsNotice = marketNews.data?.notice ?? null;
  const newsEmptyMessage =
    newsNotice ??
    (marketNews.data?.articles?.length === 0
      ? "No market news available yet."
      : "No relevant news found.");

  return (
    <>
      <PageHeader
        title="Markets"
        description="Quotes and charts load from Prosperofy through your account—never call external market APIs from the browser."
      />
      <div className="space-y-6">
        <InlineAlert tone="info">
          Market data is AI- and research-oriented. Nothing here is a promise of profit. You are responsible
          for trading decisions.
        </InlineAlert>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAB_DEFAULTS) as AssetTab[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setTab(k);
                setSearchInput("");
                setDebouncedSearch("");
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Symbol search</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search symbols across crypto, forex, stocks, and futures.
          </p>
          <input
            className="mt-3 w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Type to search (min 1 character)…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Symbol search"
          />
          {symSearch.isFetching ? <p className="mt-2 text-sm text-muted-foreground">Searching…</p> : null}
          {symSearch.isError ? (
            <p className="mt-2 text-sm text-destructive">
              {normalizeMarketDataError(symSearch.error)} — try again later.
            </p>
          ) : null}
          {searchRows.length > 0 ? (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
              {searchRows.map((r) => (
                <li key={r.symbol} className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <span className="font-mono font-medium">{r.symbol}</span>
                  <span className="truncate text-muted-foreground">{r.name}</span>
                </li>
              ))}
            </ul>
          ) : debouncedSearch.length >= 1 && !symSearch.isFetching && !symSearch.isError ? (
            <p className="mt-2 text-sm text-muted-foreground">No symbols parsed from this response shape.</p>
          ) : null}
        </section>

        {quoteErr ? (
          <InlineAlert tone="error">
            <div className="flex flex-wrap items-center gap-3">
              <span>{quoteErr}</span>
              {isRetryableError(quotesQ.error) ? (
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
        {quotesQ.isLoading ? <LoadingState label="Loading quotes…" /> : null}

        {!quotesQ.isLoading && quotesQ.data && quotesQ.data.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              Last updated {formatUpdatedAt(quotesQ.dataUpdatedAt)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quotesQ.data.map((row, index) => (
                <QuoteCard key={row.symbol ?? `quote-${index}`} row={row} />
              ))}
            </div>
          </>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Sample chart ({chartSymbol}, 1h)</h2>
              <p className="text-sm text-muted-foreground">Price history for the last 7 days.</p>
              {candlesQ.dataUpdatedAt ? (
                <p className="text-xs text-muted-foreground">
                  Last updated {formatUpdatedAt(candlesQ.dataUpdatedAt)}
                </p>
              ) : null}
            </div>
            {candleErr ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <span>{candleErr}</span>
                {isRetryableError(candlesQ.error) ? (
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
          </div>
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
                  <Line type="monotone" dataKey="close" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <NewsPanel
          title="Market news"
          articles={marketNews.data?.articles ?? []}
          freshness={marketNews.data?.data_freshness}
          isLoading={marketNews.isLoading}
          error={marketNews.error}
          emptyMessage={newsEmptyMessage}
          panel="market"
        />
      </div>
    </>
  );
}
