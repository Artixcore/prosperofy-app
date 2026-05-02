import Link from "next/link";
import type { AiAgent } from "@/types/agents";

export function AgentCard({ agent }: { agent: AiAgent }) {
  const markets = (agent.supported_markets ?? []).slice(0, 6).join(", ");
  return (
    <div className="flex flex-col rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{agent.category}</div>
      <h3 className="mt-1 text-base font-semibold text-white">{agent.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{agent.description ?? ""}</p>
      <div className="mt-3 text-xs text-zinc-500">Markets: {markets || "—"}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/agents/${agent.key}`}
          className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
        >
          Open agent
        </Link>
        <Link
          href={`/agents/${agent.key}`}
          className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
        >
          Generate analysis
        </Link>
        <Link href="/agents/history" className="rounded-md px-3 py-1.5 text-xs text-zinc-400 hover:text-white">
          View history
        </Link>
      </div>
    </div>
  );
}
