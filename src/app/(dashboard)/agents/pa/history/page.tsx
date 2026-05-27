"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { usePaHistoryQuery } from "@/features/pa/use-pa-history-api";

export default function PaHistoryPage() {
  const { data, isLoading, isError } = usePaHistoryQuery(1);

  return (
    <>
      <PageHeader
        title="PA Analysis History"
        description="Previous PA 3.0.0 analyses saved to your account."
      />
      <div className="mb-4 text-sm">
        <Link href="/agents/pa" className="font-medium text-primary hover:underline">
          ← Back to PA analysis
        </Link>
      </div>

      {isLoading ? <LoadingState label="Loading history…" /> : null}
      {isError ? (
        <InlineAlert tone="error">Could not load PA analysis history.</InlineAlert>
      ) : null}

      {data?.analyses?.length ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Timeframe</th>
                <th className="px-4 py-2">Signal</th>
                <th className="px-4 py-2">Confidence</th>
                <th className="px-4 py-2">Risk</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.analyses.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">
                    <Link href={`/agents/pa/history/${row.id}`} className="text-primary hover:underline">
                      {row.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{row.timeframe}</td>
                  <td className="px-4 py-2">{row.signal_action ?? "—"}</td>
                  <td className="px-4 py-2">
                    {row.confidence != null ? `${Math.round(Number(row.confidence) * 100)}%` : "—"}
                  </td>
                  <td className="px-4 py-2">{row.risk_level ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !isError && !data?.analyses?.length ? (
        <p className="text-sm text-muted-foreground">No PA analyses yet. Run your first analysis from the PA page.</p>
      ) : null}
    </>
  );
}
