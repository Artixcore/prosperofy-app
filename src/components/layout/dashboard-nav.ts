import {
  Bell,
  Bot,
  ChartColumn,
  CreditCard,
  Home,
  LineChart,
  PieChart,
  Receipt,
  Settings,
  Target,
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
  { href: "/strategy", label: "Strategy", icon: Target },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/activity", label: "Activity", icon: ChartColumn },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];
