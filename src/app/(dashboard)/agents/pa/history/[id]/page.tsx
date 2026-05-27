"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { PaAnalysisResults } from "@/components/pa/pa-analysis-results";
import { usePaHistoryDetailQuery } from "@/features/pa/use-pa-history-api";

export default function PaHistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;
  const { data, isLoading, isError } = usePaHistoryDetailQuery(id);

  const analysis = data?.analysis;

  return (
    <>
      <PageHeader title="PA Analysis Detail" description="Saved PA 3.0.0 analysis result." />
      <div className="mb-4 text-sm">
        <Link href="/agents/pa/history" className="font-medium text-primary hover:underline">
          ← Back to history
        </Link>
      </div>

      {isLoading ? <LoadingState label="Loading analysis…" /> : null}
      {isError ? <InlineAlert tone="error">Could not load analysis detail.</InlineAlert> : null}
      {analysis ? (
        <PaAnalysisResults
          data={{
            ...analysis,
            _meta: {
              analysis_id: analysis.id,
              signal_id: analysis.signal_id,
            },
          }}
        />
      ) : null}
    </>
  );
}
