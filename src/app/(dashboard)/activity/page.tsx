"use client";

import { useState } from "react";
import { ActivityFeedItem } from "@/components/activity/activity-feed-item";
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
        description="Your account timeline across wallet, strategy, and account events."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Your account activity will appear here as things happen."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ActivityFeedItem
              key={item.id}
              action={item.action}
              kind={item.kind}
              chain={null}
              created_at={item.created_at}
            />
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
