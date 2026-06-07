import { describe, expect, it } from "vitest";
import { normalizeAgentListResponse } from "@/features/agent/normalize-agent-list";
import type { UserAgentRecord } from "@/lib/api/types";

const sampleAgent: UserAgentRecord = {
  id: "agent-1",
  name: "BTC Watcher",
  primary_job: "Market research",
  description_prompt: "Analyze BTCUSDT",
  agent_type: "research_only",
  can_suggest_trades: false,
  can_prepare_executable_trades: false,
  risk_profile: "balanced",
  symbols: ["BTCUSDT"],
  strategy_preferences: [],
  status: "active",
};

describe("normalizeAgentListResponse", () => {
  it("normalizes preferred items + pagination shape", () => {
    const result = normalizeAgentListResponse({
      items: [sampleAgent],
      pagination: {
        current_page: 2,
        per_page: 20,
        total: 1,
        last_page: 1,
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.pagination).toEqual({
      currentPage: 2,
      perPage: 20,
      total: 1,
      lastPage: 1,
    });
  });

  it("normalizes legacy data + meta shape", () => {
    const result = normalizeAgentListResponse({
      data: [sampleAgent],
      meta: {
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1,
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.pagination.perPage).toBe(10);
  });

  it("returns safe defaults for missing fields", () => {
    const result = normalizeAgentListResponse({});

    expect(result.items).toEqual([]);
    expect(result.pagination).toEqual({
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    });
  });
});
