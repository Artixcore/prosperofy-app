"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { SignalRow } from "@/components/agents/signal-row";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { ListPagination } from "@/components/system/list-pagination";
import { useSignalsQuery } from "@/features/agents/use-agents-api";
import { MARKET_OPTIONS } from "@/types/agents";

export default function AgentsSignalsPage() {
  const [page, setPage] = useState(1);
  const q = useSignalsQuery(page);
  const err = q.isError ? normalizeApiError(q.error) : null;
  const paginator = q.data?.signals;
  const rawRows = paginator?.data ?? [];
  const [marketFilter, setMarketFilter] = useState<string>("");
  const [directionFilter, setDirectionFilter] = useState<string>("");
  const rows = useMemo(() => {
    return rawRows.filter((s) => {
      if (marketFilter && s.market_type !== marketFilter) return false;
      if (directionFilter && s.direction !== directionFilter) return false;
      return true;
    });
  }, [rawRows, marketFilter, directionFilter]);

  return (
    <>
      <PageHeader
        title="AI signals"
        description="AI-generated signals include risk scores and disclaimers. None of this is a promise of profit."
      />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/agents/signals/generate" className="font-medium text-primary hover:underline">
            Generate new signal
          </Link>
          <Link href="/agents" className="text-muted-foreground hover:text-foreground">
            Back to agents
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            Market
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-foreground"
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
            >
              <option value="">All</option>
              {MARKET_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-muted-foreground">
            Direction
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-foreground"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="long">long</option>
              <option value="short">short</option>
              <option value="watch">watch</option>
              <option value="avoid">avoid</option>
              <option value="neutral">neutral</option>
            </select>
          </label>
        </div>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!q.isLoading && !rows.length ? (
          <EmptyState title="No signals" description="Generate a signal from the dedicated flow or via the Signal agent." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full border-collapse">
              <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pl-3 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Market</th>
                  <th className="py-2 pr-4">Fresh</th>
                  <th className="py-2 pr-4">Dir</th>
                  <th className="py-2 pr-4">Conf</th>
                  <th className="py-2 pr-4">Risk</th>
                  <th className="py-2 pr-4">TF</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <SignalRow key={s.id} signal={s} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {paginator ? (
          <ListPagination page={page} lastPage={paginator.last_page} onPageChange={setPage} />
        ) : null}
      </div>
    </>
  );
}
