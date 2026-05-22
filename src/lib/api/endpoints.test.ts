import { describe, expect, it } from "vitest";
import { API } from "./endpoints";

/** Laravel registers AI orchestration under /api/app/v1/* (routes/api/app.php). */
describe("API.app.ai v1 path contract", () => {
  it("uses /api/app/v1/ prefix for all AI orchestration endpoints", () => {
    expect(API.app.ai.analysisMarket).toBe("/api/app/v1/analysis/market");
    expect(API.app.ai.strategyGenerate).toBe("/api/app/v1/strategy/generate");
    expect(API.app.ai.riskScore).toBe("/api/app/v1/risk/score");
    expect(API.app.ai.quantBacktestTrend).toBe("/api/app/v1/quant/backtest/trend");
    expect(API.app.ai.strategyEvaluateDispatch).toBe(
      "/api/app/v1/strategy/evaluate/dispatch",
    );
    expect(API.app.ai.orchestrationJob("job-uuid")).toBe(
      "/api/app/v1/orchestration/jobs/job-uuid",
    );
  });

  it("does not use legacy non-v1 AI paths", () => {
    const paths = [
      API.app.ai.analysisMarket,
      API.app.ai.strategyGenerate,
      API.app.ai.riskScore,
      API.app.ai.quantBacktestTrend,
      API.app.ai.strategyEvaluateDispatch,
    ];
    for (const path of paths) {
      expect(path).toMatch(/^\/api\/app\/v1\//);
      expect(path).not.toMatch(/^\/api\/app\/(analysis|strategy|risk|quant|orchestration)\//);
    }
  });
});
