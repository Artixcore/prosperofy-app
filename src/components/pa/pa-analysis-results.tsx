import { PaSummaryCard } from "@/components/pa/pa-summary-card";
import { PaRegimeCard } from "@/components/pa/pa-regime-card";
import { PaStrategyCard } from "@/components/pa/pa-strategy-card";
import { PaTradePlanCard } from "@/components/pa/pa-trade-plan-card";
import { PaScoresGrid } from "@/components/pa/pa-scores-grid";
import { PaIndicatorsCard } from "@/components/pa/pa-indicators-card";
import { PaReasoningBlock } from "@/components/pa/pa-reasoning-block";
import { PaWarnings } from "@/components/pa/pa-warnings";
import type { PAAnalysisResponse } from "@/types/pa";

export function PaAnalysisResults({ data }: { data: PAAnalysisResponse }) {
  const warnings = data.warnings ?? [
    "Signals are informational only and not financial advice.",
    "Use proper risk management. Losses are possible.",
  ];

  return (
    <div className="mt-8 space-y-4">
      <PaSummaryCard data={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <PaRegimeCard regime={data.regime} />
        <PaStrategyCard strategy={data.selected_strategy} />
      </div>
      <PaTradePlanCard tradePlan={data.trade_plan} />
      <PaScoresGrid scores={data.scores} />
      <PaIndicatorsCard indicators={data.indicators} />
      <PaReasoningBlock reasoning={data.reasoning} />
      <PaWarnings warnings={warnings} />
    </div>
  );
}
