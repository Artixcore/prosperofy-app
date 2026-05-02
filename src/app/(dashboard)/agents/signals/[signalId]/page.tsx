"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useSignalDetailQuery, useTrackSignalMutation } from "@/features/agents/use-agents-api";

const trackSchema = z.object({
  status: z.enum(["watching", "entered", "exited", "cancelled"]),
  notes: z.string().max(4000).optional(),
});

type TrackForm = z.infer<typeof trackSchema>;

export default function SignalDetailPage() {
  const params = useParams<{ signalId: string }>();
  const id = typeof params?.signalId === "string" ? params.signalId : "";
  const q = useSignalDetailQuery(id || null);
  const mut = useTrackSignalMutation(id);
  const form = useForm<TrackForm>({
    resolver: zodResolver(trackSchema),
    defaultValues: { status: "watching", notes: "" },
  });

  async function onTrack(values: TrackForm) {
    try {
      await mut.mutateAsync({
        status: values.status,
        notes: values.notes,
      });
    } catch (e) {
      form.setError("root", {
        message: normalizeApiError(e),
      });
    }
  }

  const err = q.isError ? normalizeApiError(q.error) : null;

  return (
    <>
      <PageHeader title="Signal details" description="Review risk, disclaimer, and optional tracking state." />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        <Link href="/agents/signals" className="text-sm font-medium text-primary hover:underline">
          ← Signals
        </Link>
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {q.data?.signal ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
            <div className="grid gap-1 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Symbol</span>{" "}
                <span className="font-medium text-foreground">{q.data.signal.symbol}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Direction</span>{" "}
                <span className="capitalize">{q.data.signal.direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence</span> {q.data.signal.confidence_score}
              </div>
              <div>
                <span className="text-muted-foreground">Risk</span> {q.data.signal.risk_score}
              </div>
            </div>
            {q.data.signal.reasoning ? (
              <p className="mt-3 text-muted-foreground">{q.data.signal.reasoning}</p>
            ) : null}
            {q.data.signal.disclaimer ? (
              <p className="mt-3 text-xs text-amber-900 dark:text-amber-100/95">{q.data.signal.disclaimer}</p>
            ) : null}
          </div>
        ) : null}

        {id ? (
          <form
            onSubmit={form.handleSubmit(onTrack)}
            className="max-w-md space-y-3 rounded-lg border border-border bg-muted/30 p-4"
          >
            <h2 className="text-sm font-medium text-foreground">Track signal</h2>
            {form.formState.errors.root ? (
              <InlineAlert tone="error">{form.formState.errors.root.message}</InlineAlert>
            ) : null}
            <FormField id="status" label="Status" error={form.formState.errors.status?.message}>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...form.register("status")}
              >
                <option value="watching">Watching</option>
                <option value="entered">Entered</option>
                <option value="exited">Exited</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
            <FormField id="notes" label="Notes" error={form.formState.errors.notes?.message}>
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...form.register("notes")}
              />
            </FormField>
            <SubmitButton pending={mut.isPending}>Update tracking</SubmitButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
