import type { PATradePlan } from "@/types/pa";

export function PaTradePlanCard({ tradePlan }: { tradePlan?: PATradePlan }) {
  if (!tradePlan) return null;

  const entryMin = tradePlan.entry_zone?.min;
  const entryMax = tradePlan.entry_zone?.max;
  const tps = tradePlan.take_profit ?? [];

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Trade plan</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {entryMin || entryMax ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Entry zone</dt>
            <dd className="font-medium text-foreground">
              {entryMin && entryMax ? `${entryMin} – ${entryMax}` : entryMin ?? entryMax}
            </dd>
          </div>
        ) : null}
        {tradePlan.stop_loss ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Stop loss</dt>
            <dd className="font-medium text-foreground">{tradePlan.stop_loss}</dd>
          </div>
        ) : null}
        {tps.map((tp) => (
          <div key={tp.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tp.label}</dt>
            <dd className="font-medium text-foreground">{tp.price}</dd>
          </div>
        ))}
        {tradePlan.risk_reward_ratio ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Risk / reward</dt>
            <dd className="font-medium text-foreground">{tradePlan.risk_reward_ratio}</dd>
          </div>
        ) : null}
        {tradePlan.invalidation ? (
          <div className="pt-2">
            <dt className="text-xs text-muted-foreground">Invalidation</dt>
            <dd className="mt-1 text-sm text-foreground">{tradePlan.invalidation}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
