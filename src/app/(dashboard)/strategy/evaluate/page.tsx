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
import { useStrategyEvaluateDispatchMutation } from "@/features/ai/use-ai-mutations";
import { useCreateStrategyMutation } from "@/features/app/use-strategies";

const schema = z.object({
  symbol: z.string().min(1).max(128),
  sentiment_score: z.coerce.number().min(-1).max(1).optional(),
  portfolio_exposure: z.coerce.number().min(0).max(3),
  current_drawdown: z.coerce.number().min(0).max(1),
  consecutive_losses: z.coerce.number().int().min(0),
  open: z.string().min(1),
  high: z.string().min(1),
  low: z.string().min(1),
  close: z.string().min(1),
  volume: z.string().min(1),
  save_strategy: z.boolean().default(true),
  strategy_name: z.string().min(1).max(256),
});

type FormValues = z.infer<typeof schema>;

function parseSeries(value: string): number[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((number) => Number.isFinite(number));
}

export default function StrategyEvaluatePage() {
  const router = useRouter();
  const mut = useStrategyEvaluateDispatchMutation();
  const createStrategy = useCreateStrategyMutation();
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "BTCUSDT",
      sentiment_score: 0,
      portfolio_exposure: 1,
      current_drawdown: 0.05,
      consecutive_losses: 0,
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
      save_strategy: true,
      strategy_name: "Evaluated strategy",
    },
  });

  async function onSubmit(values: FormValues) {
    setErr(null);
    const idempotency_key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `eval-${Date.now()}`;
    try {
      const open = parseSeries(values.open);
      const high = parseSeries(values.high);
      const low = parseSeries(values.low);
      const close = parseSeries(values.close);
      const volume = parseSeries(values.volume);
      const lengths = [open.length, high.length, low.length, close.length, volume.length];
      const size = lengths[0] ?? 0;
      if (size < 2 || lengths.some((length) => length !== size)) {
        setErr("OHLCV arrays must be numeric, non-empty, and equal length.");
        return;
      }

      if (values.save_strategy) {
        await createStrategy.mutateAsync({
          name: values.strategy_name,
          description: "Saved from evaluation input",
          market_type: "crypto",
          timeframe: "1h",
          source: "ai",
          definition: {
            symbol: values.symbol,
            open,
            high,
            low,
            close,
            volume,
            sentiment_score: values.sentiment_score,
            risk: {
              portfolio_exposure: values.portfolio_exposure,
              current_drawdown: values.current_drawdown,
              consecutive_losses: values.consecutive_losses,
            },
          },
        });
      }

      const data = await mut.mutateAsync({
        symbol: values.symbol,
        open,
        high,
        low,
        close,
        volume,
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
        description="Dispatches Laravel orchestration and redirects to job status polling."
      />
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <FormField id="symbol" label="Symbol" error={form.formState.errors.symbol?.message}>
          <input
            id="symbol"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("symbol")}
          />
        </FormField>
        <FormField id="open" label="Open values (comma-separated)" error={form.formState.errors.open?.message}>
          <textarea
            id="open"
            rows={3}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("open")}
          />
        </FormField>
        <FormField id="high" label="High values (comma-separated)" error={form.formState.errors.high?.message}>
          <textarea
            id="high"
            rows={3}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("high")}
          />
        </FormField>
        <FormField id="low" label="Low values (comma-separated)" error={form.formState.errors.low?.message}>
          <textarea
            id="low"
            rows={3}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("low")}
          />
        </FormField>
        <FormField id="close" label="Close values (comma-separated)" error={form.formState.errors.close?.message}>
          <textarea
            id="close"
            rows={3}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("close")}
          />
        </FormField>
        <FormField id="volume" label="Volume values (comma-separated)" error={form.formState.errors.volume?.message}>
          <textarea
            id="volume"
            rows={3}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("volume")}
          />
        </FormField>
        <FormField id="sent" label="Sentiment score (-1…1)" error={form.formState.errors.sentiment_score?.message}>
          <input
            id="sent"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("sentiment_score")}
          />
        </FormField>
        <p className="text-xs font-medium uppercase text-muted-foreground">Risk</p>
        <FormField id="pe" label="Portfolio exposure (0–3)" error={form.formState.errors.portfolio_exposure?.message}>
          <input
            id="pe"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("portfolio_exposure")}
          />
        </FormField>
        <FormField id="dd" label="Current drawdown (0–1)" error={form.formState.errors.current_drawdown?.message}>
          <input
            id="dd"
            type="number"
            step="0.01"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("current_drawdown")}
          />
        </FormField>
        <FormField id="cl" label="Consecutive losses" error={form.formState.errors.consecutive_losses?.message}>
          <input
            id="cl"
            type="number"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("consecutive_losses")}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="rounded border-surface-border"
            {...form.register("save_strategy")}
          />
          Save this evaluation input as a strategy
        </label>
        {form.watch("save_strategy") ? (
          <FormField
            id="strategy_name"
            label="Strategy name"
            error={form.formState.errors.strategy_name?.message}
          >
            <input
              id="strategy_name"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("strategy_name")}
            />
          </FormField>
        ) : null}
        <SubmitButton pending={mut.isPending || createStrategy.isPending}>
          Dispatch evaluation
        </SubmitButton>
      </form>
    </>
  );
}
