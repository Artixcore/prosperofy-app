"use client";

import { useEffect, useState, type ReactNode } from "react";
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

  const isNonProd = process.env.NODE_ENV !== "production";

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

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-surface">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        userEmail={user?.email}
        isNonProd={isNonProd}
      />

      <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} nav={DASHBOARD_NAV} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileDrawer={() => setDrawerOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
