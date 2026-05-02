"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { useActivityQuery } from "@/features/app/use-activity";

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const activity = useActivityQuery({ page, perPage: 15 });

  if (activity.isPending && activity.fetchStatus === "fetching") {
    return <LoadingState label="Loading activity…" />;
  }

  if (activity.isError) {
    return <ErrorState error={activity.error} onRetry={() => void activity.refetch()} />;
  }

  const items = activity.data?.items ?? [];
  const pagination = activity.data?.pagination;

  return (
    <>
      <PageHeader
        title="Activity"
        description="Your account timeline across wallet, strategy, AI, and account events."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="No account activity has been recorded yet."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 text-card-foreground"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.kind ?? "activity"}: {item.action ?? "event"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Subject: {item.subject_type ?? "—"} {item.subject_id ?? ""}
                  </p>
                  {item.correlation_id ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Correlation: {item.correlation_id}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{item.created_at ?? "Unknown time"}</p>
              </div>
              {item.payload ? (
                <pre className="mt-3 max-h-48 overflow-auto rounded-md border border-border bg-muted p-2 font-mono text-xs text-muted-foreground">
                  {JSON.stringify(item.payload, null, 2)}
                </pre>
              ) : null}
            </article>
          ))}
          {pagination?.last_page && pagination.last_page > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-sm text-secondary-foreground hover:bg-secondary disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {pagination.last_page}
              </span>
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-sm text-secondary-foreground hover:bg-secondary disabled:opacity-50"
                disabled={page >= pagination.last_page}
                onClick={() =>
                  setPage((current) =>
                    pagination.last_page ? Math.min(pagination.last_page, current + 1) : current,
                  )
                }
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
