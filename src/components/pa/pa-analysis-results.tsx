import { PaSummaryCard } from "@/components/pa/pa-summary-card";
import { PaRegimeCard } from "@/components/pa/pa-regime-card";
import { PaStrategyCard } from "@/components/pa/pa-strategy-card";
import { PaTradePlanCard } from "@/components/pa/pa-trade-plan-card";
import { PaScoresGrid } from "@/components/pa/pa-scores-grid";
import { PaIndicatorsCard } from "@/components/pa/pa-indicators-card";
import { PaReasoningBlock } from "@/components/pa/pa-reasoning-block";
import { PaWarnings } from "@/components/pa/pa-warnings";
import { PaSignalInteractions } from "@/components/pa/pa-signal-interactions";
import type { PAAnalysisResponse } from "@/types/pa";

export function PaAnalysisResults({ data }: { data: PAAnalysisResponse }) {
  const signalId = data._meta?.signal_id;
  const analysisId = data._meta?.analysis_id;
  const tradePlanText = data.trade_plan
    ? JSON.stringify(data.trade_plan, null, 2)
    : undefined;
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
      {data.user_personalization?.used && data.user_personalization.notes?.length ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Personalization</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {data.user_personalization.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {signalId ? (
        <PaSignalInteractions
          signalId={signalId}
          analysisId={analysisId}
          tradePlanText={tradePlanText}
        />
      ) : null}
      <PaWarnings warnings={warnings} />
    </div>
  );
}
