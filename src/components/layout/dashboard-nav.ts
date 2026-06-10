import {
  Bot,
  ChartColumn,
  CreditCard,
  Home,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/wallet", label: "Wallets", icon: CreditCard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/activity", label: "Activity", icon: ChartColumn },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isDashboardNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/agent") {
    return pathname === "/agent" || pathname.startsWith("/agent/") || pathname === "/strategy" || pathname.startsWith("/strategy/");
  }
  if (href === "/settings") {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }
  if (href === "/wallet") {
    return pathname === "/wallet" || pathname.startsWith("/wallet/") || pathname === "/wallets" || pathname.startsWith("/wallets/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
