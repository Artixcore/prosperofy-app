import {
  Bell,
  Bot,
  ChartColumn,
  CreditCard,
  Home,
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
  { href: "/analysis", label: "Agents", icon: Bot },
  { href: "/activity", label: "Activity", icon: ChartColumn },
  { href: "/notifications", label: "Others", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];
