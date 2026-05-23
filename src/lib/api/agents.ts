import type { MarketSignal } from "@/types/signals";

/** Laravel signal payload before canonical `source_data` normalization. */
export type RawAgentSignal = MarketSignal & {
  input_snapshot?: Record<string, unknown> | null;
  market_snapshot?: Record<string, unknown> | null;
};

export function normalizeAgentSignal(signal: RawAgentSignal): MarketSignal {
  return {
    ...signal,
    source_data:
      signal.source_data ??
      signal.source_snapshot ??
      signal.input_snapshot ??
      signal.market_snapshot ??
      null,
  };
}

export function normalizeAgentSignals(signals: RawAgentSignal[]): MarketSignal[] {
  return signals.map(normalizeAgentSignal);
}

export function normalizeSignalsPaginator<T extends { data: RawAgentSignal[] }>(
  paginator: T,
): Omit<T, "data"> & { data: MarketSignal[] } {
  return {
    ...paginator,
    data: normalizeAgentSignals(paginator.data),
  };
}
