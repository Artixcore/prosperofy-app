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
import { normalizeApiError, normalizeMarketDataError } from "@/lib/api/normalize-api-error";
import { useMarketCandles } from "@/features/market/use-market-candles";
import { useMarketQuotes } from "@/features/market/use-market-quotes";
import { useMarketSymbolsSearch } from "@/features/market/use-market-symbols";
import type { MarketQuotePayload } from "@/features/market/use-market-quote";
import { useNewsMarketQuery } from "@/features/news/use-news-api";
import { NewsPanel } from "@/components/news/news-panel";

type AssetTab = "crypto" | "forex" | "stock" | "index" | "commodity";

const TAB_DEFAULTS: Record<AssetTab, string[]> = {
  crypto: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  forex: ["EURUSD", "GBPUSD", "USDJPY"],
  stock: ["AAPL", "MSFT"],
  index: ["SPX500", "DJI"],
  commodity: ["XAUUSD", "XAGUSD"],
};

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
  const mid = row.mid ?? row.last ?? (row as { price?: string }).price ?? "—";
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

  const chartData = useMemo(() => {
    const items = candlesQ.data?.items ?? [];
    return items
      .map((c) => {
        const ts = c.timestamp ?? "";
        const close = c.close != null ? parseFloat(String(c.close)) : NaN;
        if (!ts || Number.isNaN(close)) return null;
        return { t: ts.slice(0, 16), close };
      })
      .filter(Boolean) as { t: string; close: number }[];
  }, [candlesQ.data]);

  const quoteErr = quotesQ.isError ? normalizeMarketDataError(quotesQ.error) : null;
  const candleErr = candlesQ.isError ? normalizeMarketDataError(candlesQ.error) : null;
  const marketNews = useNewsMarketQuery("global markets");

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
            Uses Laravel <code className="rounded bg-muted px-1">/api/app/market/symbols</code> only.
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
              {normalizeApiError(symSearch.error)} — try again later.
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

        {quoteErr ? <InlineAlert tone="error">{quoteErr}</InlineAlert> : null}
        {quotesQ.isLoading ? <LoadingState label="Loading quotes…" /> : null}

        {!quotesQ.isLoading && quotesQ.data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotesQ.data.map((row, index) => (
              <QuoteCard key={row.symbol ?? `quote-${index}`} row={row} />
            ))}
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Sample chart ({chartSymbol}, 1h)</h2>
              <p className="text-sm text-muted-foreground">Data from Laravel candles endpoint (7d window).</p>
            </div>
            {candleErr ? <span className="text-sm text-destructive">{candleErr}</span> : null}
          </div>
          {candlesQ.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading chart…</p>
          ) : chartData.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No candle rows returned for this symbol.</p>
          ) : (
            <div className="mt-4 h-72 w-full min-w-0">
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
        />
      </div>
    </>
  );
}
