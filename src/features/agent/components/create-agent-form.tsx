"use client";

import { useEffect, useMemo } from "react";
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
import {
  agentTypeAllowsExecutable,
  buildAgentBody,
  filterBinanceConnections,
  formatExchangeOptionLabel,
  getExecutableDisabledReason,
  isExecutableReadyConnection,
  mapUserAgentToFormValues,
  type AgentFormValues,
} from "@/features/agent/components/agent-form-helpers";
import type { UserAgentRecord } from "@/lib/api/types";

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
          message: "Max trade size is required when executable trade preparation is enabled.",
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

export type CreateAgentFormValues = AgentFormValues;

const defaultFormValues: AgentFormValues = {
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
};

type Props = {
  mode?: "create" | "edit";
  initialAgent?: UserAgentRecord;
  onSubmit: (values: CreateAgentFormValues) => Promise<void>;
  pending?: boolean;
  error?: string | null;
  submitLabel?: string;
};

export function CreateAgentForm({
  mode = "create",
  initialAgent,
  onSubmit,
  pending,
  error,
  submitLabel,
}: Props) {
  const connections = useExchangeConnectionsQuery();
  const capabilities = useAgentCapabilitiesQuery();

  const form = useForm<CreateAgentFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && initialAgent
        ? mapUserAgentToFormValues(initialAgent)
        : defaultFormValues,
  });

  const watchExecutable = form.watch("can_prepare_executable_trades");
  const watchSuggest = form.watch("can_suggest_trades");
  const watchAgentType = form.watch("agent_type");
  const watchExchangeId = form.watch("exchange_connection_id") ?? "";

  const binanceConnections = useMemo(() => {
    const items = connections.data?.connections ?? connections.data?.exchanges ?? [];
    return filterBinanceConnections(items);
  }, [connections.data]);

  const selectedExchange = binanceConnections.find((c) => String(c.id) === watchExchangeId);

  const hasValidSelectedExchange = isExecutableReadyConnection(selectedExchange, watchExchangeId);

  const platformAllowsPrep =
    capabilities.data?.executable_trade_preparation_enabled === true;

  const canEnableExecutable =
    watchSuggest &&
    agentTypeAllowsExecutable(watchAgentType) &&
    hasValidSelectedExchange &&
    platformAllowsPrep &&
    !capabilities.isLoading;

  const disabledReason = getExecutableDisabledReason({
    capabilities: capabilities.data,
    capabilitiesLoading: capabilities.isLoading,
    canSuggestTrades: watchSuggest,
    agentType: watchAgentType,
    exchangeConnectionId: watchExchangeId,
    binanceConnections,
    selectedExchange,
  });

  useEffect(() => {
    if (!watchSuggest && watchExecutable) {
      form.setValue("can_prepare_executable_trades", false);
    }
  }, [watchSuggest, watchExecutable, form]);

  useEffect(() => {
    if (!agentTypeAllowsExecutable(watchAgentType) && watchExecutable) {
      form.setValue("can_prepare_executable_trades", false);
    }
  }, [watchAgentType, watchExecutable, form]);

  useEffect(() => {
    if (!hasValidSelectedExchange && watchExecutable) {
      form.setValue("can_prepare_executable_trades", false);
    }
  }, [hasValidSelectedExchange, watchExecutable, form]);

  const showExchangeConnectLink =
    disabledReason ===
    "Connect a valid exchange in Settings before enabling executable trade preparation.";

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

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={!canEnableExecutable}
            {...form.register("can_prepare_executable_trades")}
          />
          Can prepare executable trade drafts?
        </label>
        <p className="text-xs text-muted-foreground">
          This lets the agent prepare an order draft for your review. It will not place trades
          automatically.
        </p>
      </div>

      {disabledReason && !canEnableExecutable ? (
        <InlineAlert tone="warning">
          {disabledReason}{" "}
          {showExchangeConnectLink ? (
            <>
              <Link href="/settings/exchange-connections" className="underline">
                Go to Exchange Connections
              </Link>
              .
            </>
          ) : null}
        </InlineAlert>
      ) : null}

      {watchExecutable ? (
        <InlineAlert tone="warning">
          Prepared trades still require your final confirmation before anything is sent to an
          exchange. Trading involves risk and you can lose money.
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
              {formatExchangeOptionLabel(c)}
            </option>
          ))}
        </select>
        {binanceConnections.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Connect a valid exchange in{" "}
            <Link href="/settings/exchange-connections" className="underline">
              Settings
            </Link>{" "}
            before enabling executable trade preparation.
          </p>
        ) : null}
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
            [
              "safety_not_guaranteed",
              "I understand this agent can only prepare trade drafts, not guarantee profit.",
            ],
            [
              "safety_trading_risk",
              "I understand trading involves risk and I can lose money.",
            ],
            [
              "safety_must_confirm",
              "I understand every real trade still requires my final confirmation.",
            ],
            [
              "safety_withdrawal_disabled",
              "I confirm withdrawal permission should remain disabled on my exchange API key.",
            ],
            [
              "safety_not_advice",
              "I understand Prosperofy is not financial advice.",
            ],
          ].map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 text-sm">
              <input type="checkbox" {...form.register(key as keyof CreateAgentFormValues)} />
              {label}
            </label>
          ))}
        </fieldset>
      ) : null}

      <SubmitButton pending={pending}>{submitLabel ?? "Save Agent"}</SubmitButton>
    </form>
  );
}

export function buildAgentCreateBody(values: CreateAgentFormValues) {
  return buildAgentBody(values);
}

export function buildAgentUpdateBody(values: CreateAgentFormValues) {
  return buildAgentBody(values);
}
