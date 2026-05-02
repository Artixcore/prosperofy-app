"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { AnalysisResultPanel } from "@/components/agents/analysis-result-panel";
import { isApiClientError } from "@/lib/api/errors";
import { useRunAgentMutation } from "@/features/agents/use-agents-api";
import { MARKET_OPTIONS, type AgentKey } from "@/types/agents";

const schema = z.object({
  market: z.enum(MARKET_OPTIONS),
  symbols: z.string().min(1).max(512),
  country: z.string().max(8).optional(),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]),
  risk_profile: z.enum(["conservative", "balanced", "aggressive"]),
  include_news: z.boolean(),
  include_sentiment: z.boolean(),
  include_historical: z.boolean(),
  include_trends: z.boolean(),
});

export type AgentRunFormValues = z.infer<typeof schema>;

export function AgentRunForm({
  agentKey,
  defaultSymbols,
  showCountryField,
}: {
  agentKey: AgentKey;
  defaultSymbols: string;
  showCountryField: boolean;
}) {
  const mut = useRunAgentMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm<AgentRunFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      market: "crypto",
      symbols: defaultSymbols,
      country: "",
      timeframe: "1h",
      risk_profile: "balanced",
      include_news: true,
      include_sentiment: true,
      include_historical: true,
      include_trends: false,
    },
  });

  async function onSubmit(values: AgentRunFormValues) {
    setBanner(null);
    const symbols = values.symbols
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
    try {
      await mut.mutateAsync({
        agent_key: agentKey,
        market: values.market,
        symbols,
        country: values.country || null,
        timeframe: values.timeframe,
        risk_profile: values.risk_profile,
        include_news: values.include_news,
        include_sentiment: values.include_sentiment,
        include_historical: values.include_historical,
        include_trends: values.include_trends,
      });
    } catch (e) {
      setBanner(isApiClientError(e) ? e.message : "AI analysis could not be generated. Please try again.");
    }
  }

  return (
    <>
      {banner ? <InlineAlert tone="error">{banner}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        {showCountryField ? (
          <FormField id="country" label="Country (ISO)" error={form.formState.errors.country?.message}>
            <input
              id="country"
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
              placeholder="US"
              {...form.register("country")}
            />
          </FormField>
        ) : null}
        <FormField id="market" label="Market" error={form.formState.errors.market?.message}>
          <select
            id="market"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("market")}
          >
            {MARKET_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="symbols" label="Symbols (comma or space separated)" error={form.formState.errors.symbols?.message}>
          <input
            id="symbols"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("symbols")}
          />
        </FormField>
        <FormField id="timeframe" label="Timeframe" error={form.formState.errors.timeframe?.message}>
          <select
            id="timeframe"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("timeframe")}
          >
            {(["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const).map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="risk_profile" label="Risk profile" error={form.formState.errors.risk_profile?.message}>
          <select
            id="risk_profile"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("risk_profile")}
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </FormField>
        <div className="grid gap-2 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("include_news")} /> Include news
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("include_sentiment")} /> Include sentiment
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("include_historical")} /> Include historical context
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("include_trends")} /> Include trends
          </label>
        </div>
        <SubmitButton pending={mut.isPending}>Generate analysis</SubmitButton>
      </form>
      {mut.isSuccess && mut.data ? <AnalysisResultPanel data={mut.data} /> : null}
    </>
  );
}
