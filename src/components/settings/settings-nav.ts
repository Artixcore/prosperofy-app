import {
  Bell,
  CreditCard,
  Key,
  Link2,
  Shield,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react";

export type SettingsNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    href: "/settings/account",
    label: "Account",
    description: "Manage your profile and account details.",
    icon: User,
  },
  {
    href: "/settings/security",
    label: "Security",
    description: "Update security settings and protect your account.",
    icon: Shield,
  },
  {
    href: "/settings/api-management",
    label: "API Management",
    description: "Manage API keys and developer access.",
    icon: Key,
  },
  {
    href: "/settings/exchange-connections",
    label: "Exchange Connections",
    description: "Connect exchanges like Binance securely.",
    icon: Link2,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    description: "Manage your plan, invoices, and payments.",
    icon: CreditCard,
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    description: "Choose how you receive important updates.",
    icon: Bell,
  },
  {
    href: "/settings/preferences",
    label: "Preferences",
    description: "Customize your dashboard experience.",
    icon: SlidersHorizontal,
  },
];

export function isSettingsNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
