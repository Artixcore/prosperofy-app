import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { MarketCandlesPayload } from "@/features/market/use-market-candles";
import type { MarketQuotePayload } from "@/features/market/use-market-quote";

export type MarketQuotesEnvelope = {
  quotes?: MarketQuotePayload[];
  items?: MarketQuotePayload[];
};

const DEFAULT_ASSET_CLASS = "crypto";

export async function getMarketQuote(
  token: string,
  symbol: string,
  assetClass: string = DEFAULT_ASSET_CLASS,
): Promise<MarketQuotePayload> {
  const params = new URLSearchParams({
    asset_class: assetClass,
    symbol: symbol.toUpperCase(),
  });
  return laravelFetch<MarketQuotePayload>(
    `${API.app.market.quote}?${params.toString()}`,
    { token },
  );
}

export async function getMarketQuotes(
  token: string,
  symbols: string[],
  assetClass: string = DEFAULT_ASSET_CLASS,
): Promise<MarketQuotePayload[]> {
  const params = new URLSearchParams({
    asset_class: assetClass,
    symbols: symbols.map((s) => s.toUpperCase()).join(","),
  });
  const data = await laravelFetch<MarketQuotesEnvelope>(
    `${API.app.market.quotes}?${params.toString()}`,
    { token },
  );
  const rows = data.quotes ?? data.items;
  return Array.isArray(rows) ? rows : [];
}

export async function getMarketCandles(
  token: string,
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  assetClass: string = DEFAULT_ASSET_CLASS,
): Promise<MarketCandlesPayload> {
  const params = new URLSearchParams({
    asset_class: assetClass,
    symbol: symbol.toUpperCase(),
    resolution,
    from: String(from),
    to: String(to),
  });
  return laravelFetch<MarketCandlesPayload>(
    `${API.app.market.candles}?${params.toString()}`,
    { token },
  );
}
