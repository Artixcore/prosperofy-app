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
import {
  useQuantBacktestMutation,
  useRiskScoreMutation,
  useStrategyGenerateMutation,
} from "@/features/ai/use-ai-mutations";
import {
  useCreateStrategyMutation,
  useStrategiesQuery,
  useStrategyEvaluationsQuery,
  useUpdateStrategyMutation,
} from "@/features/app/use-strategies";
import type { StrategyRecord } from "@/lib/api/types";

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
  open: z.string().min(1),
  high: z.string().min(1),
  low: z.string().min(1),
  close: z.string().min(1),
  volume: z.string().min(1),
  window: z.coerce.number().min(2).max(500).optional(),
});

const TF = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

function parseSeries(value: string): number[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((number) => Number.isFinite(number));
}

function normalizeMarketType(
  value: string,
): "crypto" | "forex" | "stock" | "futures" | undefined {
  if (value === "crypto" || value === "forex" || value === "stock" || value === "futures") {
    return value;
  }
  return undefined;
}

export default function StrategyPage() {
  const genMut = useStrategyGenerateMutation();
  const riskMut = useRiskScoreMutation();
  const btMut = useQuantBacktestMutation();
  const saveMut = useCreateStrategyMutation();
  const [listPage, setListPage] = useState(1);
  const strategies = useStrategiesQuery({ page: listPage, perPage: 10 });
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyRecord | null>(null);
  const strategyUpdateMut = useUpdateStrategyMutation(selectedStrategy?.id ?? "");
  const evaluations = useStrategyEvaluationsQuery(selectedStrategy?.id ?? null, {
    page: 1,
    perPage: 5,
  });

  const [tab, setTab] = useState<"generate" | "risk" | "backtest">("generate");
  const [err, setErr] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("AI generated strategy");
  const [saveDescription, setSaveDescription] = useState("");

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
    defaultValues: {
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
      window: 14,
    },
  });

  async function saveGeneratedStrategy() {
    if (!genMut.data) return;
    setSaveBanner(null);
    try {
      await saveMut.mutateAsync({
        name: saveName,
        description: saveDescription || null,
        market_type: genForm.getValues("marketType"),
        timeframe: genForm.getValues("timeframe"),
        source: "ai",
        definition: genMut.data,
      });
      setSaveBanner("Generated strategy saved.");
      await strategies.refetch();
    } catch (error) {
      setSaveBanner(isApiClientError(error) ? error.message : "Failed to save generated strategy.");
    }
  }

  async function saveManualStrategy() {
    setSaveBanner(null);
    try {
      await saveMut.mutateAsync({
        name: "Manual strategy draft",
        description: "User-authored strategy draft",
        market_type: genForm.getValues("marketType"),
        timeframe: genForm.getValues("timeframe"),
        source: "user",
        definition: {
          goal: genForm.getValues("goal"),
          riskTolerance: genForm.getValues("riskTolerance"),
          capital: genForm.getValues("capital") || null,
        },
      });
      setSaveBanner("Strategy draft saved.");
      await strategies.refetch();
    } catch (error) {
      setSaveBanner(isApiClientError(error) ? error.message : "Failed to save strategy.");
    }
  }

  return (
    <>
      <PageHeader
        title="Strategy and quant"
        description="Generate, score, backtest, and persist strategies through Laravel."
      />
      <InlineAlert tone="info">
        Strategies are probabilistic tools, not guarantees of profit. Always review risk before execution.
      </InlineAlert>
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      {saveBanner ? (
        <InlineAlert tone={saveBanner.toLowerCase().includes("failed") ? "error" : "success"}>
          {saveBanner}
        </InlineAlert>
      ) : null}
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
            <div className="space-y-4">
              <pre className="max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
                {JSON.stringify(genMut.data, null, 2)}
              </pre>
              <FormField id="save_name" label="Save as strategy name">
                <input
                  id="save_name"
                  value={saveName}
                  onChange={(event) => setSaveName(event.target.value)}
                  className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
                />
              </FormField>
              <FormField id="save_description" label="Description (optional)">
                <textarea
                  id="save_description"
                  rows={2}
                  value={saveDescription}
                  onChange={(event) => setSaveDescription(event.target.value)}
                  className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
                />
              </FormField>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saveMut.isPending || !saveName.trim()}
                  onClick={() => void saveGeneratedStrategy()}
                  className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveMut.isPending ? "Please wait…" : "Save generated strategy"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveManualStrategy()}
                  className="rounded-md border border-surface-border px-3 py-2 text-sm text-zinc-300 hover:bg-surface-raised"
                >
                  Save form as draft
                </button>
              </div>
            </div>
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
              const open = parseSeries(v.open);
              const high = parseSeries(v.high);
              const low = parseSeries(v.low);
              const close = parseSeries(v.close);
              const volume = parseSeries(v.volume);
              const lengths = [open.length, high.length, low.length, close.length, volume.length];
              const size = lengths[0] ?? 0;
              if (size < 2 || lengths.some((length) => length !== size)) {
                setErr("OHLCV arrays must be numeric, non-empty, and equal length.");
                return;
              }
              const body: Record<string, unknown> = {
                open,
                high,
                low,
                close,
                volume,
              };
              if (v.window != null) body.window = v.window;
              await btMut.mutateAsync(body);
            } catch (e) {
              setErr(isApiClientError(e) ? e.message : "Backtest failed.");
            }
          })}
        >
          <FormField id="bt_open" label="Open values (comma-separated)" error={btForm.formState.errors.open?.message}>
            <textarea
              id="bt_open"
              rows={3}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("open")}
            />
          </FormField>
          <FormField id="bt_high" label="High values (comma-separated)" error={btForm.formState.errors.high?.message}>
            <textarea
              id="bt_high"
              rows={3}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("high")}
            />
          </FormField>
          <FormField id="bt_low" label="Low values (comma-separated)" error={btForm.formState.errors.low?.message}>
            <textarea
              id="bt_low"
              rows={3}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("low")}
            />
          </FormField>
          <FormField id="bt_close" label="Close values (comma-separated)" error={btForm.formState.errors.close?.message}>
            <textarea
              id="bt_close"
              rows={3}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("close")}
            />
          </FormField>
          <FormField id="bt_volume" label="Volume values (comma-separated)" error={btForm.formState.errors.volume?.message}>
            <textarea
              id="bt_volume"
              rows={3}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              {...btForm.register("volume")}
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
          <SubmitButton pending={btMut.isPending}>Run backtest</SubmitButton>
          {btMut.isSuccess && btMut.data ? (
            <pre className="max-h-96 overflow-auto rounded-md bg-black/40 p-4 font-mono text-xs text-zinc-400">
              {JSON.stringify(btMut.data, null, 2)}
            </pre>
          ) : null}
        </form>
      ) : null}

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Saved strategies</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-surface-border px-3 py-1 text-sm text-zinc-300 disabled:opacity-50"
              disabled={listPage <= 1}
              onClick={() => setListPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-surface-border px-3 py-1 text-sm text-zinc-300"
              onClick={() => setListPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
        {strategies.isPending && strategies.fetchStatus === "fetching" ? (
          <p className="text-sm text-zinc-500">Loading saved strategies…</p>
        ) : strategies.isError ? (
          <InlineAlert tone="error">
            {isApiClientError(strategies.error)
              ? strategies.error.message
              : "Failed to load saved strategies."}
          </InlineAlert>
        ) : (strategies.data?.items?.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-500">No saved strategies yet.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {strategies.data?.items.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                className={`rounded-lg border p-4 text-left ${
                  selectedStrategy?.id === strategy.id
                    ? "border-accent bg-surface-raised"
                    : "border-surface-border bg-surface-raised/40"
                }`}
                onClick={() => setSelectedStrategy(strategy)}
              >
                <p className="text-sm font-medium text-white">{strategy.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {strategy.market_type} • {strategy.timeframe} • {strategy.source}
                </p>
                {strategy.description ? (
                  <p className="mt-1 text-sm text-zinc-400">{strategy.description}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedStrategy ? (
        <section className="mt-8 space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-5">
          <h3 className="text-sm font-semibold text-white">Selected strategy</h3>
          <FormField id="selected_name" label="Name">
            <input
              id="selected_name"
              value={selectedStrategy.name}
              onChange={(event) =>
                setSelectedStrategy((current) =>
                  current
                    ? {
                        ...current,
                        name: event.target.value,
                      }
                    : current,
                )
              }
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            />
          </FormField>
          <FormField id="selected_description" label="Description">
            <textarea
              id="selected_description"
              rows={2}
              value={selectedStrategy.description ?? ""}
              onChange={(event) =>
                setSelectedStrategy((current) =>
                  current
                    ? {
                        ...current,
                        description: event.target.value,
                      }
                    : current,
                )
              }
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            />
          </FormField>
          <button
            type="button"
            disabled={strategyUpdateMut.isPending}
            onClick={async () => {
              try {
                const marketType = normalizeMarketType(selectedStrategy.market_type);
                await strategyUpdateMut.mutateAsync({
                  name: selectedStrategy.name,
                  description: selectedStrategy.description ?? null,
                  market_type: marketType,
                  timeframe: selectedStrategy.timeframe,
                  definition: selectedStrategy.definition,
                });
                setSaveBanner("Strategy updated.");
                await strategies.refetch();
              } catch (error) {
                setSaveBanner(isApiClientError(error) ? error.message : "Failed to update strategy.");
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {strategyUpdateMut.isPending ? "Please wait…" : "Update strategy"}
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Evaluation history
            </p>
            {(evaluations.data?.items?.length ?? 0) === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No evaluations linked to this strategy yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {evaluations.data?.items.map((job) => (
                  <li
                    key={job.id}
                    className="rounded border border-surface-border bg-surface p-3 text-sm text-zinc-300"
                  >
                    <p className="font-medium text-white">
                      {job.type} - {job.status}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Attempts: {job.attempts} | Updated: {job.updated_at ?? "—"}
                    </p>
                    {job.last_error ? (
                      <p className="mt-1 text-xs text-red-300">{job.last_error}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}
