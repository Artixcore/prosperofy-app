import type { PAAnalysisResponse } from "@/types/pa";

const SCORE_KEYS: Array<{ key: string; label: string }> = [
  { key: "trend", label: "Trend" },
  { key: "momentum", label: "Momentum" },
  { key: "volatility", label: "Volatility" },
  { key: "volume", label: "Volume" },
  { key: "risk_reward", label: "Risk / reward" },
  { key: "news_sentiment", label: "News sentiment" },
  { key: "total", label: "Total" },
];

export function PaScoresGrid({ scores }: { scores?: PAAnalysisResponse["scores"] }) {
  if (!scores) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Scores</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SCORE_KEYS.map(({ key, label }) => {
          const val = scores[key];
          if (val === null || val === undefined) return null;
          return (
            <div key={key} className="rounded-md border border-border/80 bg-muted/30 px-3 py-2">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-0.5 text-lg font-semibold text-foreground">{val}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
