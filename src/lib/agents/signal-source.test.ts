import { describe, expect, it } from "vitest";
import { getSignalNewsContext, getSignalSourceData } from "@/lib/agents/signal-source";
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

describe("getSignalSourceData", () => {
  it("returns empty object when both fields missing", () => {
    expect(getSignalSourceData({})).toEqual({});
  });

  it("prefers source_data over source_snapshot", () => {
    const signal: MarketSignal = {
      ...baseSignal,
      source_data: { news_impact: "positive" },
      source_snapshot: { news_impact: "negative" },
    };
    expect(getSignalSourceData(signal).news_impact).toBe("positive");
  });
});

describe("getSignalNewsContext", () => {
  it("extracts news fields safely", () => {
    const signal: MarketSignal = {
      ...baseSignal,
      source_data: {
        news_impact: "mixed",
        news_sources: [{ title: "Headline", source_name: "Reuters" }],
        data_freshness: "cached",
      },
      data_freshness: "live",
    };
    const ctx = getSignalNewsContext(signal);
    expect(ctx.newsImpact).toBe("mixed");
    expect(ctx.newsSources).toHaveLength(1);
    expect(ctx.dataFreshness).toBe("cached");
  });
});
