"use client";

import {
  Activity,
  Bot,
  CreditCard,
  Link2,
  Receipt,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { resolveActivityDisplay, type ActivityIconKey } from "@/lib/activity/activity-labels";

const ICON_MAP: Record<ActivityIconKey, LucideIcon> = {
  wallet: Wallet,
  "credit-card": CreditCard,
  bot: Bot,
  receipt: Receipt,
  link: Link2,
  activity: Activity,
};

type Props = {
  action?: string | null;
  kind?: string | null;
  chain?: string | null;
  created_at?: string | null;
  compact?: boolean;
};

export function ActivityFeedItem({ action, kind, chain, created_at, compact = false }: Props) {
  const display = resolveActivityDisplay({ action, kind, chain, created_at });
  const Icon = ICON_MAP[display.icon];

  return (
    <div
      className={`flex gap-3 rounded-lg border border-surface-border bg-surface px-3 py-2 ${
        compact ? "" : "sm:px-4 sm:py-3"
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-content-muted">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-content-primary">{display.title}</p>
        {display.description && !compact ? (
          <p className="mt-0.5 text-xs text-content-muted">{display.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-content-muted">{display.subtitle}</p>
      </div>
    </div>
  );
}
