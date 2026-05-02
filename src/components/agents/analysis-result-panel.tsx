"use client";

/** JSON preview for AI/agent outputs — escape is structural (React text nodes). */

export function AnalysisResultPanel({ data }: { data: unknown }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-foreground">Result</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Outputs are probabilistic guidance only — not a promise of profit or loss avoidance.
      </p>
      <pre className="mt-2 max-h-[520px] overflow-auto rounded-md border border-border bg-muted p-4 font-mono text-xs text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
