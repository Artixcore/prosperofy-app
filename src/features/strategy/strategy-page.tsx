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
import { demoOhlcv } from "@/lib/ai/demo-series";
import {
  useQuantBacktestMutation,
  useRiskScoreMutation,
  useStrategyGenerateMutation,
} from "@/features/ai/use-ai-mutations";

const generateSchema = z.object({
  marketType: z.enum(["crypto", "forex", "stock", "futures"]),
  goal: z.string().min(1).max(4096),
  riskTolerance: z.enum(["low", "medium", "high"]),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]),
  capital: z.string().optional(),
});

const riskSchema = z.object({
  marketType: z.enum(["crypto", "forex", "stock", "futures"]),
  symbol: z.string().min(1).max(64),
  confidence: z.coerce.number().min(0).max(1),
  volatility_indicator: z.coerce.number().min(0).max(1).optional(),
  exposure: z.coerce.number().min(0).max(1).optional(),
});

const backtestSchema = z.object({
  window: z.coerce.number().min(2).max(500).optional(),
  length: z.coerce.number().min(10).max(500).default(60),
});

const TF = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

export default function StrategyPage() {
  const genMut = useStrategyGenerateMutation();
  const riskMut = useRiskScoreMutation();
  const btMut = useQuantBacktestMutation();
  const [tab, setTab] = useState<"generate" | "risk" | "backtest">("generate");
  const [err, setErr] = useState<string | null>(null);

  const genForm = useForm<z.infer<typeof generateSchema>>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      marketType: "crypto",
      goal: "Balanced growth with drawdown control.",
      riskTolerance: "medium",
      timeframe: "1d",
      capital: "",
    },
  });

  const riskForm = useForm({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      marketType: "crypto" as const,
      symbol: "BTCUSDT",
      confidence: 0.65,
      volatility_indicator: 0.4,
      exposure: 0.3,
    },
  });

  const btForm = useForm({
    resolver: zodResolver(backtestSchema),
    defaultValues: { length: 60, window: 14 },
  });

  return (
    <>
      <PageHeader
        title="Strategy and quant"
        description="Sync endpoints: generate, risk score, and trend backtest via Laravel /api/app/v1/*."
      />
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      <div className="mt-4 flex gap-2 border-b border-surface-border pb-2">
        {(
          [
            ["generate", "Generate"],
            ["risk", "Risk score"],
            ["backtest", "Backtest"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k);
              setErr(null);
            }}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === k ? "bg-surface-raised text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "generate" ? (
        <form
          className="mt-6 max-w-xl space-y-4"
          onSubmit={genForm.handleSubmit(async (v) => {
            setErr(null);
            try {
              const body: Record<string, unknown> = { ...v };
              if (v.capital) body.capital = Number(v.capital);
              await genMut.mutateAsync(body);
            } catch (e) {
              setErr(isApiClientError(e) ? e.message : "Generation failed.");
            }
          })}
        >
          <FormField id="g_market" label="Market type" error={genForm.formState.errors.marketType?.message}>
            <select
              id="g_market"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...genForm.register("marketType")}
            >
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
              <option value="stock">Stock</option>
              <option value="futures">Futures</option>
            </select>
          </FormField>
          <FormField id="g_goal" label="Goal" error={genForm.formState.errors.goal?.message}>
            <textarea
              id="g_goal"
              rows={4}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...genForm.register("goal")}
            />
          </FormField>
          <FormField id="g_risk" label="Risk tolerance" error={genForm.formState.errors.riskTolerance?.message}>
            <select
              id="g_risk"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...genForm.register("riskTolerance")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>
          <FormField id="g_tf" label="Timeframe" error={genForm.formState.errors.timeframe?.message}>
            <select
              id="g_tf"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...genForm.register("timeframe")}
            >
              {TF.map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="g_cap" label="Capital (optional)" error={genForm.formState.errors.capital?.message}>
            <input
              id="g_cap"
              type="number"
              step="any"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...genForm.register("capital")}
            />
          </FormField>
          <SubmitButton pending={genMut.isPending}>Generate strategy</SubmitButton>
          {genMut.isSuccess && genMut.data ? (
            <pre className="max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
              {JSON.stringify(genMut.data, null, 2)}
            </pre>
          ) : null}
        </form>
      ) : null}

      {tab === "risk" ? (
        <form
          className="mt-6 max-w-xl space-y-4"
          onSubmit={riskForm.handleSubmit(async (v) => {
            setErr(null);
            try {
              await riskMut.mutateAsync({
                marketType: v.marketType,
                symbol: v.symbol,
                confidence: v.confidence,
                volatility_indicator: v.volatility_indicator,
                exposure: v.exposure,
              });
            } catch (e) {
              setErr(isApiClientError(e) ? e.message : "Risk scoring failed.");
            }
          })}
        >
          <FormField id="r_market" label="Market type" error={riskForm.formState.errors.marketType?.message}>
            <select
              id="r_market"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...riskForm.register("marketType")}
            >
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
              <option value="stock">Stock</option>
              <option value="futures">Futures</option>
            </select>
          </FormField>
          <FormField id="r_sym" label="Symbol" error={riskForm.formState.errors.symbol?.message}>
            <input
              id="r_sym"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...riskForm.register("symbol")}
            />
          </FormField>
          <FormField id="r_conf" label="Confidence (0–1)" error={riskForm.formState.errors.confidence?.message}>
            <input
              id="r_conf"
              type="number"
              step="0.01"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...riskForm.register("confidence")}
            />
          </FormField>
          <SubmitButton pending={riskMut.isPending}>Score risk</SubmitButton>
          {riskMut.isSuccess && riskMut.data ? (
            <pre className="max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
              {JSON.stringify(riskMut.data, null, 2)}
            </pre>
          ) : null}
        </form>
      ) : null}

      {tab === "backtest" ? (
        <form
          className="mt-6 max-w-xl space-y-4"
          onSubmit={btForm.handleSubmit(async (v) => {
            setErr(null);
            try {
              const series = demoOhlcv(v.length);
              const body: Record<string, unknown> = {
                open: series.open,
                high: series.high,
                low: series.low,
                close: series.close,
                volume: series.volume,
              };
              if (v.window != null) body.window = v.window;
              await btMut.mutateAsync(body);
            } catch (e) {
              setErr(isApiClientError(e) ? e.message : "Backtest failed.");
            }
          })}
        >
          <FormField id="bt_len" label="Series length (bars)" error={btForm.formState.errors.length?.message}>
            <input
              id="bt_len"
              type="number"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("length")}
            />
          </FormField>
          <FormField id="bt_win" label="Window (optional)" error={btForm.formState.errors.window?.message}>
            <input
              id="bt_win"
              type="number"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("window")}
            />
          </FormField>
          <p className="text-xs text-zinc-500">Uses synthetic OHLCV for a quick gateway test.</p>
          <SubmitButton pending={btMut.isPending}>Run backtest</SubmitButton>
          {btMut.isSuccess && btMut.data ? (
            <pre className="max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
              {JSON.stringify(btMut.data, null, 2)}
            </pre>
          ) : null}
        </form>
      ) : null}
    </>
  );
}
