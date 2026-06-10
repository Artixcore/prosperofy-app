"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { AiActionType, AiRecommendationRecord } from "@/lib/api/types";
import { AI_ACTION_CARDS } from "@/features/ai/ai-action-config";
import { AiOverviewCards } from "@/features/ai/components/ai-overview-cards";
import { AiActionCard } from "@/features/ai/components/ai-action-card";
import { AiRecommendationCard } from "@/features/ai/components/ai-recommendation-card";
import { AiRecommendationsSection } from "@/features/ai/components/ai-recommendations-section";
import type { AiActionButtonConfig } from "@/features/ai/ai-action-config";
import {
  useAiRecommendationsQuery,
  useCreateAiActionMutation,
  useDismissAiRecommendationMutation,
  useSaveAiRecommendationMutation,
} from "@/features/ai/use-ai-actions";

export default function AiActionCenterPage() {
  const { pushToast } = useToast();
  const [activeRecommendation, setActiveRecommendation] = useState<AiRecommendationRecord | null>(null);
  const [activeActionType, setActiveActionType] = useState<AiActionType | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const latest = useAiRecommendationsQuery({ status: "ready", perPage: 5 });
  const saved = useAiRecommendationsQuery({ status: "saved", perPage: 5 });
  const createAction = useCreateAiActionMutation();
  const saveRecommendation = useSaveAiRecommendationMutation();
  const dismissRecommendation = useDismissAiRecommendationMutation();

  const pendingRecommendationId =
    saveRecommendation.isPending || dismissRecommendation.isPending
      ? (saveRecommendation.variables ?? dismissRecommendation.variables ?? null)
      : null;

  async function handleAction(button: AiActionButtonConfig) {
    setActionError(null);
    setActiveActionType(button.actionType);
    try {
      const result = await createAction.mutateAsync({
        action_type: button.actionType,
        context: button.context,
      });
      setActiveRecommendation(result.recommendation);
      setShowDetails(false);
    } catch (error) {
      setActionError(
        normalizeApiError(error) ||
          "We couldn't create this recommendation right now. Please try again.",
      );
    } finally {
      setActiveActionType(null);
    }
  }

  async function handleSave(id: string) {
    try {
      const result = await saveRecommendation.mutateAsync(id);
      if (activeRecommendation?.id === id) {
        setActiveRecommendation(result.recommendation);
      }
      pushToast({ tone: "success", title: "Recommendation saved." });
    } catch (error) {
      pushToast({ tone: "error", title: normalizeApiError(error) });
    }
  }

  async function handleDismiss(id: string) {
    try {
      const result = await dismissRecommendation.mutateAsync(id);
      if (activeRecommendation?.id === id) {
        setActiveRecommendation(result.recommendation);
      }
      pushToast({ tone: "success", title: "Recommendation dismissed." });
    } catch (error) {
      pushToast({ tone: "error", title: normalizeApiError(error) });
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Action Center"
        description="Analyze your wallets, portfolio, spending, and rewards with guided AI actions."
      />

      <AiOverviewCards />

      <section aria-label="AI action cards" className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-content-primary">AI action cards</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AI_ACTION_CARDS.map((card) => (
            <AiActionCard
              key={card.id}
              card={card}
              activeActionType={activeActionType}
              pending={createAction.isPending}
              onAction={handleAction}
            />
          ))}
        </div>
      </section>

      {actionError ? (
        <div className="mb-6">
          <InlineAlert tone="error">{actionError}</InlineAlert>
        </div>
      ) : null}

      <section aria-label="Active recommendation" className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-content-primary">Latest insight</h2>
        {activeRecommendation ? (
          <AiRecommendationCard
            recommendation={activeRecommendation}
            onSave={() => void handleSave(activeRecommendation.id)}
            onDismiss={() => void handleDismiss(activeRecommendation.id)}
            pending={pendingRecommendationId === activeRecommendation.id}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails((v) => !v)}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-surface-border px-4 py-8 text-center text-sm text-content-muted">
            No recommendation yet. Choose an action above to get started.
          </p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <AiRecommendationsSection
          title="Latest recommendations"
          emptyTitle="No recommendations yet. Choose an action above to get started."
          items={latest.data?.items ?? []}
          onSave={(id) => void handleSave(id)}
          onDismiss={(id) => void handleDismiss(id)}
          pendingId={pendingRecommendationId}
        />
        <AiRecommendationsSection
          title="Saved ideas"
          emptyTitle="No saved ideas yet. Save a recommendation to keep it here."
          items={saved.data?.items ?? []}
          onSave={(id) => void handleSave(id)}
          onDismiss={(id) => void handleDismiss(id)}
          pendingId={pendingRecommendationId}
        />
      </div>
    </div>
  );
}
