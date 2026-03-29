"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { isApiClientError } from "@/lib/api/errors";
import { demoOhlcv } from "@/lib/ai/demo-series";
import { useStrategyEvaluateDispatchMutation } from "@/features/ai/use-ai-mutations";

const schema = z.object({
  symbol: z.string().min(1).max(128),
  sentiment_score: z.coerce.number().min(-1).max(1).optional(),
  portfolio_exposure: z.coerce.number().min(0).max(3),
  current_drawdown: z.coerce.number().min(0).max(1),
  consecutive_losses: z.coerce.number().int().min(0),
  bars: z.coerce.number().min(35).max(500).default(40),
});

type FormValues = z.infer<typeof schema>;

export default function StrategyEvaluatePage() {
  const router = useRouter();
  const mut = useStrategyEvaluateDispatchMutation();
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "BTCUSDT",
      sentiment_score: 0,
      portfolio_exposure: 1,
      current_drawdown: 0.05,
      consecutive_losses: 0,
      bars: 40,
    },
  });

  async function onSubmit(values: FormValues) {
    setErr(null);
    const series = demoOhlcv(values.bars);
    const idempotency_key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `eval-${Date.now()}`;
    try {
      const data = await mut.mutateAsync({
        symbol: values.symbol,
        open: series.open,
        high: series.high,
        low: series.low,
        close: series.close,
        volume: series.volume,
        sentiment_score: values.sentiment_score,
        risk: {
          portfolio_exposure: values.portfolio_exposure,
          current_drawdown: values.current_drawdown,
          consecutive_losses: values.consecutive_losses,
        },
        idempotency_key,
      });
      const jobId = data.job_id;
      if (jobId) {
        router.push(`/jobs/${jobId}`);
        return;
      }
      setErr("No job id returned. Check the API response in network tools.");
    } catch (e) {
      setErr(isApiClientError(e) ? e.message : "Dispatch failed.");
    }
  }

  return (
    <>
      <PageHeader
        title="Strategy evaluation (async)"
        description="Dispatches Laravel orchestration. You are redirected to the job status page to poll safely."
      />
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <FormField id="symbol" label="Symbol" error={form.formState.errors.symbol?.message}>
          <input
            id="symbol"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("symbol")}
          />
        </FormField>
        <FormField id="bars" label="OHLC bars (synthetic)" error={form.formState.errors.bars?.message}>
          <input
            id="bars"
            type="number"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("bars")}
          />
        </FormField>
        <FormField id="sent" label="Sentiment score (-1…1)" error={form.formState.errors.sentiment_score?.message}>
          <input
            id="sent"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("sentiment_score")}
          />
        </FormField>
        <p className="text-xs font-medium uppercase text-zinc-500">Risk</p>
        <FormField id="pe" label="Portfolio exposure (0–3)" error={form.formState.errors.portfolio_exposure?.message}>
          <input
            id="pe"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("portfolio_exposure")}
          />
        </FormField>
        <FormField id="dd" label="Current drawdown (0–1)" error={form.formState.errors.current_drawdown?.message}>
          <input
            id="dd"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("current_drawdown")}
          />
        </FormField>
        <FormField id="cl" label="Consecutive losses" error={form.formState.errors.consecutive_losses?.message}>
          <input
            id="cl"
            type="number"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("consecutive_losses")}
          />
        </FormField>
        <SubmitButton pending={mut.isPending}>Dispatch evaluation</SubmitButton>
      </form>
    </>
  );
}
