"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavItem } from "@/components/layout/dashboard-nav";

export function DashboardNavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
}: DashboardNavItem & { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-xl py-2 text-sm transition motion-safe:transition-colors ${
        collapsed ? "justify-center px-2" : "px-3"
      } ${
        active
          ? "bg-surface-raised text-content-primary ring-1 ring-surface-border"
          : "text-content-muted hover:bg-surface-raised/60 hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className={collapsed ? "sr-only" : ""}>{label}</span>
    </Link>
  );
}
