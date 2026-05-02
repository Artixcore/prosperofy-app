import Link from "next/link";
import type { AiAgent } from "@/types/agents";

export function AgentCard({ agent }: { agent: AiAgent }) {
  const markets = (agent.supported_markets ?? []).slice(0, 6).join(", ");
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{agent.category}</div>
      <h3 className="mt-1 text-base font-semibold text-foreground">{agent.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{agent.description ?? ""}</p>
      <div className="mt-3 text-xs text-muted-foreground">Markets: {markets || "—"}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/agents/${agent.key}`}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          Open agent
        </Link>
        <Link
          href={`/agents/${agent.key}`}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary"
        >
          Generate analysis
        </Link>
        <Link
          href="/agents/history"
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          View history
        </Link>
      </div>
    </div>
  );
}
