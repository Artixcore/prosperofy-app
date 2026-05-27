"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSignalInteractionMutation,
  type SignalInteractionType,
} from "@/features/agents/use-signal-interactions";
import { InlineAlert } from "@/components/system/inline-alert";

export function PaSignalInteractions({
  signalId,
  analysisId,
  tradePlanText,
}: {
  signalId: number;
  analysisId?: number;
  tradePlanText?: string;
}) {
  const mut = useSignalInteractionMutation(signalId);
  const qc = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  async function interact(type: SignalInteractionType) {
    setMessage(null);
    try {
      await mut.mutateAsync({
        interaction_type: type,
        pa_analysis_result_id: analysisId,
      });
      if (type === "copied_trade_plan" && tradePlanText) {
        await navigator.clipboard.writeText(tradePlanText);
        setMessage("Trade plan copied to clipboard.");
      } else if (type === "saved") {
        setMessage("Signal saved.");
      } else if (type === "dismissed") {
        setMessage("Signal dismissed.");
      } else {
        setMessage("Thanks for your feedback.");
      }
      void qc.invalidateQueries({ queryKey: ["agent-signals"] });
      void qc.invalidateQueries({ queryKey: ["trading-profile"] });
    } catch {
      setMessage("Could not record interaction. Please try again.");
    }
  }

  const btn =
    "rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted";

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">Signal actions</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={mut.isPending} onClick={() => interact("saved")}>
          Save
        </button>
        <button type="button" className={btn} disabled={mut.isPending} onClick={() => interact("dismissed")}>
          Dismiss
        </button>
        <button
          type="button"
          className={btn}
          disabled={mut.isPending}
          onClick={() => interact("marked_useful")}
        >
          Useful
        </button>
        <button
          type="button"
          className={btn}
          disabled={mut.isPending}
          onClick={() => interact("marked_not_useful")}
        >
          Not useful
        </button>
        <button
          type="button"
          className={btn}
          disabled={mut.isPending}
          onClick={() => interact("copied_trade_plan")}
        >
          Copy trade plan
        </button>
      </div>
      {message ? <InlineAlert tone="info">{message}</InlineAlert> : null}
    </div>
  );
}
