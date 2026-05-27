import type { PASelectedStrategy } from "@/types/pa";

export function PaStrategyCard({ strategy }: { strategy?: PASelectedStrategy }) {
  if (!strategy?.name) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Selected strategy</h2>
      <p className="mt-1 text-base font-semibold capitalize text-foreground">
        {strategy.name.replace(/_/g, " ")}
      </p>
      {strategy.score !== undefined ? (
        <p className="mt-1 text-sm text-muted-foreground">Score: {strategy.score}</p>
      ) : null}
      {strategy.reason ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{strategy.reason}</p>
      ) : null}
    </section>
  );
}
