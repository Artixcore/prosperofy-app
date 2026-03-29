"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { useOrchestrationJobQuery } from "@/features/ai/use-ai-mutations";

function isTerminal(status: string): boolean {
  return ["completed", "failed", "cancelled"].includes(status);
}

function JobContent({ jobId }: { jobId: string }) {
  const { data, isPending, isError, error, refetch, fetchStatus } = useOrchestrationJobQuery(jobId);

  if (isPending && fetchStatus === "fetching") {
    return <LoadingState label="Loading job…" />;
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const terminal = isTerminal(data.status);
  const polling = !terminal;

  return (
    <>
      <PageHeader
        title={`Job ${data.id.slice(0, 8)}…`}
        description={polling ? "Polling Laravel for status every few seconds until the job finishes." : "Terminal state reached."}
        action={
          <Link href="/strategy/evaluate" className="text-sm text-accent-muted hover:underline">
            New evaluation
          </Link>
        }
      />
      {polling ? (
        <InlineAlert tone="info">Status: {data.status} — listening for updates…</InlineAlert>
      ) : data.status === "completed" ? (
        <InlineAlert tone="success">Completed</InlineAlert>
      ) : (
        <InlineAlert tone="error">Finished as: {data.status}</InlineAlert>
      )}
      <dl className="mt-6 grid max-w-2xl gap-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-zinc-500">Type</dt>
          <dd className="font-mono text-sm text-white">{data.type}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-zinc-500">Status</dt>
          <dd className="text-sm text-white">{data.status}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-zinc-500">Attempts</dt>
          <dd className="text-sm text-white">{data.attempts}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-zinc-500">Symbol</dt>
          <dd className="text-sm text-white">{data.payload_summary?.symbol ?? "—"}</dd>
        </div>
        {data.last_error ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-zinc-500">Last error</dt>
            <dd className="mt-1 text-sm text-red-300">{data.last_error}</dd>
          </div>
        ) : null}
        {data.result_summary ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-zinc-500">Result summary</dt>
            <dd className="mt-1 text-sm text-zinc-300">
              success: {String(data.result_summary.success)} — {data.result_summary.message ?? "—"}
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-400">Raw job payload (gateway-safe)</h2>
        <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-500">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </>
  );
}

export default function JobStatusPage() {
  const params = useParams();
  const jobId = typeof params.jobId === "string" ? params.jobId : null;

  if (!jobId) {
    return <ErrorState error={new Error("Invalid job id.")} />;
  }

  return <JobContent jobId={jobId} />;
}
