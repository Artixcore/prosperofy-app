"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
};

export function SidebarCollapseButton({ collapsed, onToggle, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls="dashboard-sidebar"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={`rounded-lg border border-surface-border p-2 text-content-muted hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:transition-colors ${className}`}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" aria-hidden />
      ) : (
        <PanelLeftClose className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
