import type { PARegime } from "@/types/pa";

export function PaRegimeCard({ regime }: { regime?: PARegime }) {
  if (!regime?.name) return null;

  const pct =
    regime.confidence !== undefined ? Math.round(regime.confidence * 100) : null;

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Market regime</h2>
      <p className="mt-1 text-base font-semibold capitalize text-foreground">
        {regime.name.replace(/_/g, " ")}
      </p>
      {pct !== null ? (
        <p className="mt-1 text-sm text-muted-foreground">Confidence: {pct}%</p>
      ) : null}
      {regime.reason ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{regime.reason}</p>
      ) : null}
    </section>
  );
}
