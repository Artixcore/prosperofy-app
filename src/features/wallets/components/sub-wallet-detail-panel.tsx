"use client";

import type { SubWalletCard as SubWalletCardType } from "@/lib/api/types";

type Props = {
  wallet: SubWalletCardType | null;
  onAction: (actionKey: string) => void;
};

export function SubWalletDetailPanel({ wallet, onAction }: Props) {
  if (!wallet) return null;

  return (
    <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-content-primary">{wallet.name}</h2>
      <p className="mt-1 text-sm text-content-muted">{wallet.description}</p>

      <div className="mt-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-content-muted">Purpose</h3>
        <ul className="mt-2 space-y-2">
          {wallet.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-content-primary before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-primary before:content-['']"
            >
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-content-muted">
          Quick actions
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {wallet.actions.map((action) => (
            <button
              key={action.key}
              type="button"
              aria-disabled={!action.enabled}
              onClick={() => onAction(action.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                action.enabled
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "cursor-not-allowed bg-muted text-content-muted"
              }`}
            >
              {action.label}
              {!action.enabled && action.reason ? (
                <span className="ml-2 text-xs font-normal opacity-80">({action.reason})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
