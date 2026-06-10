"use client";

import { PiggyBank, TrendingUp, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SubWalletCard as SubWalletCardType, SubWalletType } from "@/lib/api/types";

const ICONS: Record<SubWalletType, LucideIcon> = {
  save: PiggyBank,
  invest: TrendingUp,
  spend: CreditCard,
};

const STATUS_LABELS: Record<string, string> = {
  ready: "Ready",
  pending: "Pending",
  inactive: "Inactive",
};

type Props = {
  wallet: SubWalletCardType;
  selected: boolean;
  onSelect: () => void;
  onAction: (actionKey: string) => void;
};

export function SubWalletCard({ wallet, selected, onSelect, onAction }: Props) {
  const Icon = ICONS[wallet.type];

  return (
    <article
      className={`flex w-full min-w-0 max-w-full flex-col rounded-2xl border bg-card p-5 shadow-soft transition-colors ${
        selected ? "border-primary ring-1 ring-primary/30" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
        aria-pressed={selected}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-content-primary">{wallet.name}</h3>
              <p className="text-xs text-content-muted">
                {STATUS_LABELS[wallet.status] ?? "Ready"}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-content-muted">{wallet.description}</p>
        <p className="mt-4 text-sm text-content-muted">Balance</p>
        <p className="text-2xl font-semibold tabular-nums text-content-primary">
          {wallet.balance}{" "}
          <span className="text-base font-medium text-content-muted">{wallet.currency}</span>
        </p>
      </button>

      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        {wallet.actions.map((action) => (
          <button
            key={action.key}
            type="button"
            aria-disabled={!action.enabled}
            onClick={() => onAction(action.key)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium motion-safe:transition-colors ${
              action.enabled
                ? "border-border bg-background text-content-primary hover:bg-muted"
                : "cursor-not-allowed border-border/60 bg-muted/40 text-content-muted"
            }`}
          >
            {action.label}
            {!action.enabled ? (
              <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-70">
                Coming soon
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </article>
  );
}
