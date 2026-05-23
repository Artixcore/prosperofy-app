import type { NewsSourceRow } from "@/types/news";
import type { MarketSignal } from "@/types/signals";

/** Read canonical source payload (normalize via `normalizeAgentSignal` at API boundaries). */
export function getSignalSourceData(
  signal: Pick<MarketSignal, "source_data">,
): Record<string, unknown> {
  return signal.source_data ?? {};
}

function isNewsSourceRow(value: unknown): value is NewsSourceRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.title === "string";
}

export function getSignalNewsContext(signal: MarketSignal): {
  newsImpact: string | undefined;
  newsSources: NewsSourceRow[];
  dataFreshness: string | undefined;
} {
  const sd = getSignalSourceData(signal);
  const rawSources = sd.news_sources;
  const newsSources = Array.isArray(rawSources)
    ? rawSources.filter(isNewsSourceRow)
    : [];

  return {
    newsImpact: typeof sd.news_impact === "string" ? sd.news_impact : undefined,
    newsSources,
    dataFreshness:
      typeof sd.data_freshness === "string"
        ? sd.data_freshness
        : signal.data_freshness ?? undefined,
  };
}
