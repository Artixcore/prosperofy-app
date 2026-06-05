"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { useExchangeConnectionsQuery } from "@/features/exchanges/use-exchange-connections";
import { useAgentCapabilitiesQuery } from "@/features/agent/use-agents";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";

const schema = z
  .object({
    name: z.string().min(1).max(80),
    primary_job: z.string().min(1).max(120),
    description_prompt: z.string().min(1).max(5000),
    agent_type: z.enum([
      "research_only",
      "trade_suggestion",
      "portfolio_monitor",
      "risk_monitor",
      "custom",
    ]),
    can_suggest_trades: z.boolean(),
    can_prepare_executable_trades: z.boolean(),
    symbols: z.string().optional(),
    timeframe: z.enum(["5m", "15m", "1h", "4h", "1d"]),
    risk_profile: z.enum(["conservative", "balanced", "aggressive"]),
    max_trade_size: z.string().optional(),
    exchange_connection_id: z.string().optional(),
    strategy_trend_following: z.boolean().optional(),
    strategy_momentum: z.boolean().optional(),
    strategy_mean_reversion: z.boolean().optional(),
    strategy_breakout: z.boolean().optional(),
    strategy_risk_first: z.boolean().optional(),
    strategy_portfolio_rebalance: z.boolean().optional(),
    safety_trading_risk: z.boolean().optional(),
    safety_not_guaranteed: z.boolean().optional(),
    safety_must_confirm: z.boolean().optional(),
    safety_withdrawal_disabled: z.boolean().optional(),
    safety_not_advice: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.can_prepare_executable_trades) {
      if (!data.max_trade_size || Number(data.max_trade_size) <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Max trade size is required when executable trading is enabled.",
          path: ["max_trade_size"],
        });
      }
      if (!data.exchange_connection_id) {
        ctx.addIssue({
          code: "custom",
          message: "Select a Binance connection.",
          path: ["exchange_connection_id"],
        });
      }
      const checks = [
        data.safety_trading_risk,
        data.safety_not_guaranteed,
        data.safety_must_confirm,
        data.safety_withdrawal_disabled,
        data.safety_not_advice,
      ];
      if (!checks.every(Boolean)) {
        ctx.addIssue({
          code: "custom",
          message: "All safety confirmations are required.",
          path: ["safety_trading_risk"],
        });
      }
    }
  });

export type CreateAgentFormValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: CreateAgentFormValues) => Promise<void>;
  pending?: boolean;
  error?: string | null;
};

export function CreateAgentForm({ onSubmit, pending, error }: Props) {
  const connections = useExchangeConnectionsQuery();
  const capabilities = useAgentCapabilitiesQuery();

  const form = useForm<CreateAgentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      primary_job: "Market research",
      description_prompt: "",
      agent_type: "research_only",
      can_suggest_trades: false,
      can_prepare_executable_trades: false,
      symbols: "BTCUSDT, ETHUSDT",
      timeframe: "1h",
      risk_profile: "balanced",
      max_trade_size: "",
      exchange_connection_id: "",
    },
  });

  const watchExecutable = form.watch("can_prepare_executable_trades");
  const watchSuggest = form.watch("can_suggest_trades");

  const binanceConnections = useMemo(() => {
    const items = connections.data?.connections ?? connections.data?.exchanges ?? [];
    return items.filter(
      (c) => c.exchange === "binance" && c.is_valid && !c.can_withdraw,
    );
  }, [connections.data]);

  const canEnableExecutable =
    capabilities.data?.has_trading_binance_connection ?? false;

  return (
    <form
      className="mx-auto max-w-2xl space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
      <p className="text-xs text-muted-foreground">{AGENT_DISCLAIMER}</p>

      <FormField id="name" label="Agent Name" error={form.formState.errors.name?.message}>
        <input
          id="name"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
          placeholder="BTC Scalping Watcher"
          {...form.register("name")}
        />
      </FormField>

      <FormField id="primary_job" label="Work / Primary Job" error={form.formState.errors.primary_job?.message}>
        <select
          id="primary_job"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("primary_job")}
        >
          <option value="Market research">Market research</option>
          <option value="Portfolio monitoring">Portfolio monitoring</option>
          <option value="Trade opportunity detection">Trade opportunity detection</option>
          <option value="Risk analysis">Risk analysis</option>
          <option value="Binance portfolio analysis">Binance portfolio analysis</option>
          <option value="Custom">Custom</option>
        </select>
      </FormField>

      <FormField
        id="description_prompt"
        label="Description / Prompt"
        error={form.formState.errors.description_prompt?.message}
      >
        <textarea
          id="description_prompt"
          rows={4}
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          placeholder="Analyze BTCUSDT and ETHUSDT on Binance using trend, volume, and support/resistance."
          {...form.register("description_prompt")}
        />
      </FormField>

      <FormField id="agent_type" label="Agent Type">
        <select
          id="agent_type"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("agent_type")}
        >
          <option value="research_only">Research only</option>
          <option value="trade_suggestion">Trade suggestion</option>
          <option value="portfolio_monitor">Portfolio monitor</option>
          <option value="risk_monitor">Risk monitor</option>
          <option value="custom">Custom</option>
        </select>
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("can_suggest_trades")} />
        Can suggest trades?
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={!canEnableExecutable}
          {...form.register("can_prepare_executable_trades")}
        />
        Can prepare executable trades?
      </label>

      {!canEnableExecutable && (watchExecutable || watchSuggest) ? (
        <InlineAlert tone="warning">
          Connect Binance in{" "}
          <Link href="/settings/exchange-connections" className="underline">
            Settings → Exchange Connections
          </Link>{" "}
          first (valid connection, trading enabled, withdrawals disabled).
        </InlineAlert>
      ) : null}

      {watchExecutable ? (
        <InlineAlert tone="warning">
          This agent can prepare executable Binance trades for your review. It cannot execute
          without your final confirmation. Trading involves risk and you can lose money.
        </InlineAlert>
      ) : null}

      <FormField id="exchange_connection_id" label="Connected exchange">
        <select
          id="exchange_connection_id"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("exchange_connection_id")}
        >
          <option value="">None</option>
          {binanceConnections.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.label ?? `Binance #${c.id}`}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="symbols" label="Symbols / Watchlist">
        <input
          id="symbols"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          placeholder="BTCUSDT, ETHUSDT, SOLUSDT"
          {...form.register("symbols")}
        />
      </FormField>

      <FormField id="timeframe" label="Timeframe">
        <select
          id="timeframe"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("timeframe")}
        >
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
        </select>
      </FormField>

      <FormField id="risk_profile" label="Risk profile">
        <select
          id="risk_profile"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("risk_profile")}
        >
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </FormField>

      <FormField
        id="max_trade_size"
        label="Max trade size (USDT)"
        error={form.formState.errors.max_trade_size?.message}
      >
        <input
          id="max_trade_size"
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("max_trade_size")}
        />
      </FormField>

      <fieldset className="space-y-2 rounded-md border border-border p-3">
        <legend className="px-1 text-sm font-medium">Strategy preferences</legend>
        {[
          ["strategy_trend_following", "Trend following"],
          ["strategy_momentum", "Momentum"],
          ["strategy_mean_reversion", "Mean reversion"],
          ["strategy_breakout", "Breakout"],
          ["strategy_risk_first", "Risk-first"],
          ["strategy_portfolio_rebalance", "Portfolio rebalance"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register(key as keyof CreateAgentFormValues)} />
            {label}
          </label>
        ))}
      </fieldset>

      {watchExecutable ? (
        <fieldset className="space-y-2 rounded-md border border-amber-500/40 p-3">
          <legend className="px-1 text-sm font-medium">Safety confirmations</legend>
          {[
            ["safety_trading_risk", "I understand trading can lose money."],
            ["safety_not_guaranteed", "I understand agent suggestions are not guaranteed."],
            ["safety_must_confirm", "I understand I must review and confirm every trade."],
            ["safety_withdrawal_disabled", "I confirm withdrawal permission is disabled on my Binance API key."],
            ["safety_not_advice", "I understand Prosperofy is not financial advice."],
          ].map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 text-sm">
              <input type="checkbox" {...form.register(key as keyof CreateAgentFormValues)} />
              {label}
            </label>
          ))}
        </fieldset>
      ) : null}

      <SubmitButton pending={pending}>Save Agent</SubmitButton>
    </form>
  );
}

export function buildAgentCreateBody(values: CreateAgentFormValues) {
  const symbols = (values.symbols ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20);

  const strategy_preferences: string[] = [];
  if (values.strategy_trend_following) strategy_preferences.push("trend_following");
  if (values.strategy_momentum) strategy_preferences.push("momentum");
  if (values.strategy_mean_reversion) strategy_preferences.push("mean_reversion");
  if (values.strategy_breakout) strategy_preferences.push("breakout");
  if (values.strategy_risk_first) strategy_preferences.push("risk_first");
  if (values.strategy_portfolio_rebalance) strategy_preferences.push("portfolio_rebalance");

  return {
    name: values.name,
    primary_job: values.primary_job,
    description_prompt: values.description_prompt,
    agent_type: values.agent_type,
    can_suggest_trades: values.can_suggest_trades,
    can_prepare_executable_trades: values.can_prepare_executable_trades,
    symbols,
    timeframe: values.timeframe,
    risk_profile: values.risk_profile,
    max_trade_size: values.max_trade_size ? Number(values.max_trade_size) : undefined,
    exchange_connection_id: values.exchange_connection_id
      ? Number(values.exchange_connection_id)
      : undefined,
    strategy_preferences,
    safety_confirmations: values.can_prepare_executable_trades
      ? {
          understand_trading_risk: Boolean(values.safety_trading_risk),
          understand_suggestions_not_guaranteed: Boolean(values.safety_not_guaranteed),
          understand_must_confirm_trades: Boolean(values.safety_must_confirm),
          confirm_withdrawal_disabled: Boolean(values.safety_withdrawal_disabled),
          understand_not_financial_advice: Boolean(values.safety_not_advice),
        }
      : undefined,
  };
}
