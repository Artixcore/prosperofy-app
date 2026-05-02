"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/app/use-notifications";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState<string | null>(null);
  const query = useNotificationsQuery({ page, perPage: 10 });
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const items = query.data?.items ?? [];
  const pagination = query.data?.pagination;
  const unreadCount = items.filter((notification) => notification.read === false).length;

  async function onMarkRead(id: string) {
    setBanner(null);
    try {
      await markOne.mutateAsync(id);
    } catch (error) {
      setBanner(normalizeApiError(error));
    }
  }

  async function onMarkAllRead() {
    setBanner(null);
    try {
      const result = await markAll.mutateAsync();
      setBanner(result.marked > 0 ? `Marked ${result.marked} notification(s) as read.` : "Nothing to mark.");
    } catch (error) {
      setBanner(normalizeApiError(error));
    }
  }

  if (query.isPending && query.fetchStatus === "fetching") {
    return <LoadingState label="Loading notifications…" />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Your real in-app notifications from Laravel."
        action={
          <button
            type="button"
            onClick={() => void onMarkAllRead()}
            disabled={markAll.isPending || items.length === 0 || unreadCount === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {markAll.isPending ? "Please wait…" : "Mark all read"}
          </button>
        }
      />
      {banner ? (
        <InlineAlert tone={/^(Marked|Nothing to mark)/.test(banner) ? "success" : "error"}>{banner}</InlineAlert>
      ) : null}
      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are all caught up. New notifications will appear here."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Unread in this page: {unreadCount}</p>
          <ul className="space-y-3">
            {items.map((notification) => (
              <li
                key={notification.id}
                className="rounded-lg border border-border bg-card p-4 text-card-foreground"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {notification.title ?? notification.type ?? "Notification"}
                    </p>
                    {notification.body ? (
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {notification.created_at ?? "Unknown time"}
                    </p>
                  </div>
                  {notification.read ? (
                    <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                      Read
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void onMarkRead(notification.id)}
                      disabled={markOne.isPending}
                      className="rounded border border-border px-2 py-1 text-xs text-secondary-foreground hover:bg-secondary disabled:opacity-60"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
