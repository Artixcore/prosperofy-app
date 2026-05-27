"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizePaAnalysisError } from "@/lib/api/normalize-api-error";
import { usePaAnalyzeMutation } from "@/features/pa/use-pa-api";
import { PA_SYMBOLS, PA_TIMEFRAMES, type PAAnalysisResponse } from "@/types/pa";

const schema = z.object({
  symbol: z.enum(PA_SYMBOLS),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  lookback: z.coerce.number().min(50).max(1000),
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
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "SOLUSDT",
      timeframe: "15m",
      lookback: 250,
      include_news: true,
      include_emotion: true,
    },
  });

  async function onSubmit(values: FormValues) {
    setBanner(null);
    try {
      const data = await mut.mutateAsync({
        symbol: values.symbol,
        asset_class: "crypto",
        timeframe: values.timeframe,
        lookback: values.lookback,
        include_news: values.include_news,
        include_emotion: values.include_emotion,
      });
      onResult(data);
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
            {...form.register("symbol")}
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
            {...form.register("timeframe")}
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
          <input type="checkbox" {...form.register("include_news")} />
          Include news context
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...form.register("include_emotion")} />
          Include emotion / sentiment
        </label>

        <SubmitButton pending={mut.isPending}>Run PA 3.0.0 Analysis</SubmitButton>
      </form>
    </>
  );
}
