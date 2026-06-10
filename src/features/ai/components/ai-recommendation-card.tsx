"use client";

import type { AiRecommendationRecord } from "@/lib/api/types";

type Props = {
  recommendation: AiRecommendationRecord;
  onSave: () => void;
  onDismiss: () => void;
  pending?: boolean;
  showDetails?: boolean;
  onToggleDetails?: () => void;
};

export function AiRecommendationCard({
  recommendation,
  onSave,
  onDismiss,
  pending,
  showDetails,
  onToggleDetails,
}: Props) {
  return (
    <article className="rounded-xl border border-primary/30 bg-surface-raised p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-content-primary">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-content-muted">{recommendation.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-1 capitalize text-content-muted">
            Risk level: {recommendation.risk_level}
          </span>
          {recommendation.confidence_score != null ? (
            <span className="rounded-full bg-muted px-2 py-1 text-content-muted">
              Confidence: {recommendation.confidence_score}%
            </span>
          ) : null}
        </div>
      </div>

      {showDetails && recommendation.details ? (
        <p className="mt-3 text-sm text-content-primary">{recommendation.details}</p>
      ) : null}

      <p className="mt-3 text-xs text-content-muted">{recommendation.disclaimer}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {recommendation.details && onToggleDetails ? (
          <button
            type="button"
            className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-content-primary hover:bg-muted disabled:opacity-50"
            onClick={onToggleDetails}
            disabled={pending}
          >
            {showDetails ? "Hide details" : "Review idea"}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          onClick={onSave}
          disabled={pending || recommendation.status === "saved"}
        >
          Save idea
        </button>
        <button
          type="button"
          className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-content-muted hover:bg-muted disabled:opacity-50"
          onClick={onDismiss}
          disabled={pending || recommendation.status === "dismissed"}
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}
