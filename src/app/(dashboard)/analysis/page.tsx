"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { isApiClientError } from "@/lib/api/errors";
import { useMarketAnalysisMutation } from "@/features/ai/use-ai-mutations";

const schema = z.object({
  marketType: z.enum(["crypto", "forex", "stock", "futures"]),
  symbol: z.string().min(1).max(64),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]),
});

type FormValues = z.infer<typeof schema>;

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export default function AnalysisPage() {
  const mut = useMarketAnalysisMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      marketType: "crypto",
      symbol: "BTCUSDT",
      timeframe: "1h",
    },
  });

  async function onSubmit(values: FormValues) {
    setBanner(null);
    try {
      await mut.mutateAsync({
        marketType: values.marketType,
        symbol: values.symbol,
        timeframe: values.timeframe,
      });
    } catch (e) {
      setBanner(isApiClientError(e) ? e.message : "Analysis request failed.");
    }
  }

  return (
    <>
      <PageHeader
        title="Market analysis"
        description="POST /api/app/analysis/market — Laravel orchestrates the AI service; the browser never calls it directly."
      />
      {banner ? <InlineAlert tone="error">{banner}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <FormField id="marketType" label="Market type" error={form.formState.errors.marketType?.message}>
          <select
            id="marketType"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("marketType")}
          >
            <option value="crypto">Crypto</option>
            <option value="forex">Forex</option>
            <option value="stock">Stock</option>
            <option value="futures">Futures</option>
          </select>
        </FormField>
        <FormField id="symbol" label="Symbol" error={form.formState.errors.symbol?.message}>
          <input
            id="symbol"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("symbol")}
          />
        </FormField>
        <FormField id="timeframe" label="Timeframe" error={form.formState.errors.timeframe?.message}>
          <select
            id="timeframe"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("timeframe")}
          >
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </FormField>
        <SubmitButton pending={mut.isPending}>Run analysis</SubmitButton>
      </form>
      {mut.isSuccess && mut.data ? (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-300">Result</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Use this analysis as guidance only. Markets can move against any strategy.
          </p>
          {(() => {
            const result = asRecord(mut.data);
            if (!result) return null;
            const confidence = result.confidence;
            const riskScore = result.risk_score ?? result.risk;
            const reasoning = result.reasoning;
            const warnings = Array.isArray(result.warnings) ? result.warnings : null;
            return (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {typeof confidence !== "undefined" ? (
                  <div className="rounded-md border border-surface-border bg-surface p-3 text-sm text-zinc-300">
                    Confidence: <span className="text-white">{String(confidence)}</span>
                  </div>
                ) : null}
                {typeof riskScore !== "undefined" ? (
                  <div className="rounded-md border border-surface-border bg-surface p-3 text-sm text-zinc-300">
                    Risk: <span className="text-white">{String(riskScore)}</span>
                  </div>
                ) : null}
                {reasoning ? (
                  <div className="rounded-md border border-surface-border bg-surface p-3 text-sm text-zinc-300 sm:col-span-2">
                    Reasoning: <span className="text-white">{String(reasoning)}</span>
                  </div>
                ) : null}
                {warnings?.length ? (
                  <div className="rounded-md border border-amber-800/60 bg-amber-950/30 p-3 text-sm text-amber-200 sm:col-span-2">
                    Warnings: {warnings.map((warning) => String(warning)).join(" | ")}
                  </div>
                ) : null}
              </div>
            );
          })()}
          <pre className="mt-2 max-h-[480px] overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
            {JSON.stringify(mut.data, null, 2)}
          </pre>
        </div>
      ) : null}
    </>
  );
}
