"use client";

import Link from "next/link";
import { humanizeEventKey, formatActivityTime } from "@/lib/activity/activity-labels";
import type { AppNotification } from "@/lib/api/types";

type Props = {
  notifications: AppNotification[];
  onMarkRead?: (id: string) => void;
  onClose: () => void;
};

export function NotificationDropdown({ notifications, onMarkRead, onClose }: Props) {
  return (
    <div
      role="menu"
      aria-label="Notifications"
      className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-surface-border bg-surface-elevated shadow-soft"
    >
      <div className="border-b border-surface-border px-4 py-3">
        <p className="text-sm font-semibold text-content-primary">Notifications</p>
      </div>
      <div className="max-h-[min(60vh,20rem)] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-content-muted">You&apos;re all caught up.</p>
        ) : (
          <ul className="divide-y divide-surface-border">
            {notifications.map((notification) => {
              const title =
                notification.title ??
                (notification.type ? humanizeEventKey(notification.type) : "Notification");
              const time = formatActivityTime(notification.created_at);
              const isUnread = notification.read === false;

              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={`block w-full px-4 py-3 text-left hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                      isUnread ? "bg-surface-raised/50" : ""
                    }`}
                    onClick={() => {
                      if (isUnread && onMarkRead) {
                        onMarkRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-content-primary">{title}</p>
                      {isUnread ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                      ) : null}
                    </div>
                    {notification.body ? (
                      <p className="mt-1 line-clamp-2 text-xs text-content-muted">{notification.body}</p>
                    ) : null}
                    {time ? <p className="mt-1 text-xs text-content-muted">{time}</p> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="border-t border-surface-border px-4 py-2">
        <Link
          href="/notifications"
          role="menuitem"
          tabIndex={-1}
          className="block rounded-lg px-2 py-2 text-center text-sm font-medium text-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={onClose}
        >
          View all
        </Link>
      </div>
    </div>
  );
}
