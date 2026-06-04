"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizePaAnalysisError } from "@/lib/api/normalize-api-error";
import { useBehaviorTracking } from "@/features/behavior/use-behavior-tracking";
import { usePaAnalyzeMutation } from "@/features/pa/use-pa-api";
import { PA_SYMBOLS, PA_TIMEFRAMES, type PAAnalysisResponse } from "@/types/pa";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  symbol: z.enum(PA_SYMBOLS),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  lookback: z.coerce.number().min(50).max(1000),
  fast_market_only: z.boolean(),
  include_news: z.boolean(),
  include_emotion: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function PaAnalysisForm({
  onResult,
}: {
  onResult: (data: PAAnalysisResponse) => void;
}) {
  const mut = usePaAnalyzeMutation();
  const { recordEvent } = useBehaviorTracking();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "SOLUSDT",
      timeframe: "15m",
      lookback: 250,
      fast_market_only: true,
      include_news: false,
      include_emotion: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setBanner(null);
    recordEvent({
      event_type: "ran_analysis",
      symbol: values.symbol,
      asset_class: "crypto",
      timeframe: values.timeframe,
      metadata: { source: "pa_3_analysis_page" },
    });
    try {
      const marketOnly = values.fast_market_only;
      const data = await mut.mutateAsync({
        symbol: values.symbol,
        asset_class: "crypto",
        timeframe: values.timeframe,
        lookback: values.lookback,
        include_news: marketOnly ? false : values.include_news,
        include_emotion: marketOnly ? false : values.include_emotion,
      });
      onResult(data);
      void qc.invalidateQueries({ queryKey: ["agent-signals"] });
      void qc.invalidateQueries({ queryKey: ["pa-history"] });
    } catch (e) {
      setBanner(normalizePaAnalysisError(e));
    }
  }

  return (
    <>
      {banner ? <InlineAlert tone="error">{banner}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-4 rounded-lg border border-border bg-card p-6 text-card-foreground"
      >
        <FormField id="symbol" label="Symbol" error={form.formState.errors.symbol?.message}>
          <select
            id="symbol"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            {...form.register("symbol", {
              onChange: (e) => {
                recordEvent(
                  {
                    event_type: "selected_symbol",
                    symbol: e.target.value,
                    asset_class: "crypto",
                    metadata: { source: "pa_3_analysis_page" },
                  },
                  400,
                );
              },
            })}
          >
            {PA_SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="timeframe" label="Timeframe" error={form.formState.errors.timeframe?.message}>
          <select
            id="timeframe"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            {...form.register("timeframe", {
              onChange: (e) => {
                recordEvent(
                  {
                    event_type: "selected_timeframe",
                    symbol: form.getValues("symbol"),
                    timeframe: e.target.value,
                    asset_class: "crypto",
                  },
                  400,
                );
              },
            })}
          >
            {PA_TIMEFRAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="lookback" label="Lookback (candles)" error={form.formState.errors.lookback?.message}>
          <input
            id="lookback"
            type="number"
            min={50}
            max={1000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            {...form.register("lookback")}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            {...form.register("fast_market_only", {
              onChange: (e) => {
                if (e.target.checked) {
                  form.setValue("include_news", false);
                  form.setValue("include_emotion", false);
                }
              },
            })}
          />
          Fast market-only analysis (recommended)
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            disabled={form.watch("fast_market_only")}
            {...form.register("include_news")}
          />
          Include news context (slower)
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            disabled={form.watch("fast_market_only")}
            {...form.register("include_emotion")}
          />
          Include emotion / sentiment (slower)
        </label>

        <SubmitButton pending={mut.isPending}>Run PA 3.0.0 Analysis</SubmitButton>
      </form>
    </>
  );
}
