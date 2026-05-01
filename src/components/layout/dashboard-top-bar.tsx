"use client";

import { Menu } from "lucide-react";
import { DashboardSearch } from "@/components/layout/dashboard-search";
import { DashboardUserMenu } from "@/components/layout/dashboard-user-menu";
import { SidebarCollapseButton } from "@/components/layout/sidebar-collapse-button";
import { WalletBalanceBadge } from "@/components/layout/wallet-balance-badge";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileDrawer: () => void;
};

export function DashboardTopBar({ sidebarCollapsed, onToggleSidebar, onOpenMobileDrawer }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-elevated/90 backdrop-blur">
      <div className="flex flex-nowrap items-center gap-2 px-3 py-2.5 sm:gap-3 md:px-5">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-surface-border p-2 text-content-muted hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden motion-safe:transition-colors"
            onClick={onOpenMobileDrawer}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
          <div className="hidden lg:block">
            <SidebarCollapseButton collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
          </div>
        </div>

        <div className="mx-2 min-w-0 max-w-full flex-1 md:mx-4 md:max-w-md lg:max-w-lg xl:max-w-xl">
          <DashboardSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle variant="compact" />
          <WalletBalanceBadge />
          <DashboardUserMenu />
        </div>
      </div>
    </header>
  );
}
