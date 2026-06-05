import {
  Bell,
  ChartColumn,
  CreditCard,
  Home,
  LineChart,
  PieChart,
  Receipt,
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
  { href: "/market", label: "Markets", icon: LineChart },
  { href: "/wallet", label: "Wallets", icon: CreditCard },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/activity", label: "Activity", icon: ChartColumn },
  { href: "/notifications", label: "Others", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];
