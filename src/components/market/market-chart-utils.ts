import type { CandleBar, ChartPoint } from "@/features/market/use-market-candles";

export function formatUpdatedAt(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function timestampLabel(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value);
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    const ms = n > 1_000_000_000_000 ? n : n * 1000;
    return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
  }
  return raw.slice(0, 16);
}

export function buildChartRows(payload: {
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

export type ChartTimeframe = "1h" | "4h" | "1d" | "7d";

export const CHART_TIMEFRAMES: { id: ChartTimeframe; label: string; resolution: string; rangeSec: number }[] = [
  { id: "1h", label: "1h", resolution: "1h", rangeSec: 86400 },
  { id: "4h", label: "4h", resolution: "4h", rangeSec: 86400 * 3 },
  { id: "1d", label: "1d", resolution: "1d", rangeSec: 86400 * 30 },
  { id: "7d", label: "7d", resolution: "1d", rangeSec: 86400 * 90 },
];

export const CRYPTO_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;

export function symbolShortLabel(symbol: string): string {
  return symbol.replace(/USDT$/i, "").toUpperCase();
}
