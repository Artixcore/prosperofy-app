import { describe, expect, it } from "vitest";
import {
  normalizeAgentSignal,
  normalizeAgentSignals,
  normalizeSignalsPaginator,
} from "@/lib/api/agents";
import type { MarketSignal } from "@/types/signals";

const baseSignal = {
  id: 1,
  agent_key: "signal",
  market_type: "crypto",
  symbol: "BTCUSDT",
  direction: "watch",
  confidence_score: 50,
  risk_score: 40,
  timeframe: "swing",
  status: "active",
} satisfies MarketSignal;

describe("normalizeAgentSignal", () => {
  it("prefers source_data when present", () => {
    const out = normalizeAgentSignal({
      ...baseSignal,
      source_data: { news_impact: "positive" },
      source_snapshot: { news_impact: "negative" },
    });
    expect(out.source_data).toEqual({ news_impact: "positive" });
  });

  it("falls back to source_snapshot then input_snapshot then market_snapshot", () => {
    expect(
      normalizeAgentSignal({
        ...baseSignal,
        source_snapshot: { tier: 1 },
      }).source_data,
    ).toEqual({ tier: 1 });

    expect(
      normalizeAgentSignal({
        ...baseSignal,
        input_snapshot: { tier: 2 },
      }).source_data,
    ).toEqual({ tier: 2 });

    expect(
      normalizeAgentSignal({
        ...baseSignal,
        market_snapshot: { tier: 3 },
      }).source_data,
    ).toEqual({ tier: 3 });
  });

  it("sets source_data to null when no snapshot fields exist", () => {
    expect(normalizeAgentSignal(baseSignal).source_data).toBeNull();
  });
});

describe("normalizeAgentSignals", () => {
  it("maps an array of signals", () => {
    const out = normalizeAgentSignals([
      { ...baseSignal, id: 1, source_snapshot: { a: 1 } },
      { ...baseSignal, id: 2 },
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].source_data).toEqual({ a: 1 });
    expect(out[1].source_data).toBeNull();
  });
});

describe("normalizeSignalsPaginator", () => {
  it("normalizes paginator data", () => {
    const out = normalizeSignalsPaginator({
      current_page: 1,
      data: [{ ...baseSignal, source_snapshot: { x: 1 } }],
      last_page: 1,
      per_page: 20,
      total: 1,
    });
    expect(out.data[0].source_data).toEqual({ x: 1 });
  });
});
