"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/app/use-notifications";

type Props = {
  unreadCount: number;
};

export function NotificationBell({ unreadCount }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const query = useNotificationsQuery({ perPage: 5, page: 1 });
  const markRead = useMarkNotificationReadMutation();

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (event.target instanceof Node && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const items = query.data?.items ?? [];

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-surface-border p-2 text-content-muted hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-colors"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <NotificationDropdown
          notifications={items}
          onMarkRead={(id) => void markRead.mutate(id)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
