export function PaReasoningBlock({ reasoning }: { reasoning: string | null | undefined }) {
  if (!reasoning?.trim()) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Reasoning</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reasoning}</p>
    </section>
  );
}
