"use client";

import type { AiRecommendationRecord } from "@/lib/api/types";
import { EmptyState } from "@/components/empty-state";
import { AiRecommendationCard } from "./ai-recommendation-card";

type Props = {
  title: string;
  emptyTitle: string;
  items: AiRecommendationRecord[];
  onSave: (id: string) => void;
  onDismiss: (id: string) => void;
  pendingId?: string | null;
};

export function AiRecommendationsSection({
  title,
  emptyTitle,
  items,
  onSave,
  onDismiss,
  pendingId,
}: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <AiRecommendationCard
                recommendation={item}
                onSave={() => onSave(item.id)}
                onDismiss={() => onDismiss(item.id)}
                pending={pendingId === item.id}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
