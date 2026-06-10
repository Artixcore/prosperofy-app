"use client";

import type { AiActionCardConfig, AiActionButtonConfig } from "@/features/ai/ai-action-config";
import type { AiActionType } from "@/lib/api/types";

type Props = {
  card: AiActionCardConfig;
  activeActionType: AiActionType | null;
  pending: boolean;
  onAction: (button: AiActionButtonConfig) => void;
};

export function AiActionCard({ card, activeActionType, pending, onAction }: Props) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-content-muted">{card.statusHint}</p>
        <h2 className="mt-1 text-lg font-semibold text-content-primary">{card.title}</h2>
        <p className="mt-2 text-sm text-content-muted">{card.purpose}</p>
        <p className="mt-2 text-xs text-content-muted">
          <span className="font-medium text-content-primary">Insight:</span> {card.insight}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {card.buttons.map((button) => {
          const isLoading = pending && activeActionType === button.actionType;
          return (
            <button
              key={button.actionType}
              type="button"
              className="rounded-lg border border-surface-border bg-background px-3 py-2 text-left text-sm font-medium text-content-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onAction(button)}
              disabled={pending}
              aria-busy={isLoading}
            >
              {isLoading ? "Creating insight…" : button.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}
