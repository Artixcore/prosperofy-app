"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { DASHBOARD_NAV } from "@/components/layout/dashboard-nav";
import { MobileSidebarDrawer } from "@/components/layout/mobile-sidebar-drawer";
import { useNotificationsQuery } from "@/features/app/use-notifications";
import { useAuth } from "@/lib/auth/session-context";

const SIDEBAR_COLLAPSED_KEY = "prosperofy.sidebarCollapsed";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const unreadQuery = useNotificationsQuery({ unread: true, perPage: 1, page: 1 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadFromPagination = unreadQuery.data?.pagination?.total;
  const unreadCount =
    typeof unreadFromPagination === "number"
      ? unreadFromPagination
      : (unreadQuery.data?.items?.length ?? 0);

  const isNonProd =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== "undefined"
      ? process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
      : process.env.NODE_ENV !== "production";

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const drawerNav = useMemo(
    () =>
      DASHBOARD_NAV.map((item) => ({
        ...item,
        label:
          item.href === "/notifications" && unreadCount > 0
            ? `${item.label} (${unreadCount})`
            : item.label,
      })),
    [unreadCount],
  );

  return (
    <div className="flex min-h-screen min-w-0 bg-surface">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        unreadCount={unreadCount}
        userEmail={user?.email}
        isNonProd={isNonProd}
      />

      <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} nav={drawerNav} />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <DashboardTopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileDrawer={() => setDrawerOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
