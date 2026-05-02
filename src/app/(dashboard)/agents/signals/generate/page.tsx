"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useGenerateSignalMutation } from "@/features/agents/use-agents-api";
import { AGENT_KEYS, MARKET_OPTIONS, type AgentKey } from "@/types/agents";

const TIMEFRAMES = [
  "scalp",
  "intraday",
  "swing",
  "position",
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
  "1w",
] as const;

const schema = z.object({
  agent_key: z
    .string()
    .refine((k): k is AgentKey => (AGENT_KEYS as readonly string[]).includes(k), {
      message: "Choose a valid agent.",
    }),
  market: z.enum(MARKET_OPTIONS),
  symbols: z.string().min(1).max(512),
  timeframe: z.enum(TIMEFRAMES),
  risk_profile: z.enum(["conservative", "balanced", "aggressive"]),
  include_news: z.boolean(),
  include_sentiment: z.boolean(),
  include_historical: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function GenerateSignalPage() {
  const mut = useGenerateSignalMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      agent_key: "signal",
      market: "crypto",
      symbols: "BTC",
      timeframe: "1h",
      risk_profile: "balanced",
      include_news: true,
      include_sentiment: true,
      include_historical: true,
    },
  });

  async function onSubmit(values: FormValues) {
    setBanner(null);
    const symbols = values.symbols
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    try {
      await mut.mutateAsync({
        agent_key: values.agent_key,
        market: values.market,
        symbols,
        timeframe: values.timeframe,
        risk_profile: values.risk_profile,
        include_news: values.include_news,
        include_sentiment: values.include_sentiment,
        include_historical: values.include_historical,
      });
    } catch (e) {
      setBanner(normalizeApiError(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Generate signal"
        description="Creates a risk-managed AI-assisted signal suggestion stored in Laravel."
      />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        {banner ? <InlineAlert tone="error">{banner}</InlineAlert> : null}
        <Link href="/agents/signals" className="text-sm font-medium text-primary hover:underline">
          ← Back to signals
        </Link>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-xl space-y-4 rounded-lg border border-border bg-muted/30 p-6"
        >
          <FormField id="agent_key" label="Agent" error={form.formState.errors.agent_key?.message}>
            <select
              id="agent_key"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("agent_key")}
            >
              {AGENT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="market" label="Market" error={form.formState.errors.market?.message}>
            <select
              id="market"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("market")}
            >
              {MARKET_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="symbols" label="Symbols" error={form.formState.errors.symbols?.message}>
            <input
              id="symbols"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("symbols")}
            />
          </FormField>
          <FormField id="timeframe" label="Timeframe" error={form.formState.errors.timeframe?.message}>
            <select
              id="timeframe"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("timeframe")}
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="risk_profile" label="Risk profile" error={form.formState.errors.risk_profile?.message}>
            <select
              id="risk_profile"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("risk_profile")}
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </FormField>
          <div className="grid gap-2 text-sm text-foreground">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("include_news")} /> Include news
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("include_sentiment")} /> Include sentiment
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("include_historical")} /> Include historical context
            </label>
          </div>
          <SubmitButton pending={mut.isPending}>Generate signal</SubmitButton>
        </form>

        {mut.isSuccess && mut.data ? (
          <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-muted p-4 font-mono text-xs text-muted-foreground">
            {JSON.stringify(mut.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </>
  );
}
