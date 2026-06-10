import type { AgentCapabilities, ExchangeConnectionSummary, UserAgentRecord } from "@/lib/api/types";

export type AgentFormValues = {
  name: string;
  primary_job: string;
  description_prompt: string;
  agent_type:
    | "research_only"
    | "trade_suggestion"
    | "portfolio_monitor"
    | "risk_monitor"
    | "custom";
  can_suggest_trades: boolean;
  can_prepare_executable_trades: boolean;
  symbols?: string;
  timeframe: "5m" | "15m" | "1h" | "4h" | "1d";
  risk_profile: "conservative" | "balanced" | "aggressive";
  max_trade_size?: string;
  exchange_connection_id?: string;
  strategy_trend_following?: boolean;
  strategy_momentum?: boolean;
  strategy_mean_reversion?: boolean;
  strategy_breakout?: boolean;
  strategy_risk_first?: boolean;
  strategy_portfolio_rebalance?: boolean;
  safety_trading_risk?: boolean;
  safety_not_guaranteed?: boolean;
  safety_must_confirm?: boolean;
  safety_withdrawal_disabled?: boolean;
  safety_not_advice?: boolean;
};

export const EXECUTABLE_AGENT_TYPES = [
  "trade_suggestion",
  "portfolio_monitor",
  "custom",
] as const;

export type ExecutableAgentType = (typeof EXECUTABLE_AGENT_TYPES)[number];

export function filterBinanceConnections(
  connections: ExchangeConnectionSummary[] | undefined,
): ExchangeConnectionSummary[] {
  const items = connections ?? [];
  return items.filter(
    (c) =>
      c.exchange === "binance" &&
      c.is_valid &&
      c.status === "connected" &&
      !c.can_withdraw,
  );
}

export function isExecutableReadyConnection(
  connection: ExchangeConnectionSummary | undefined,
  connectionId: string,
): boolean {
  return Boolean(
    connectionId &&
      connection?.is_valid &&
      connection.status === "connected" &&
      !connection.can_withdraw &&
      connection.can_trade,
  );
}

export function agentTypeAllowsExecutable(agentType: string): boolean {
  return EXECUTABLE_AGENT_TYPES.includes(agentType as ExecutableAgentType);
}

export function getExecutableDisabledReason(args: {
  capabilities: AgentCapabilities | undefined;
  capabilitiesLoading: boolean;
  canSuggestTrades: boolean;
  agentType: string;
  exchangeConnectionId: string;
  binanceConnections: ExchangeConnectionSummary[];
  selectedExchange: ExchangeConnectionSummary | undefined;
}): string | null {
  if (args.capabilitiesLoading) {
    return null;
  }

  if (args.capabilities?.executable_trade_preparation_enabled !== true) {
    return "Executable trade preparation is disabled by platform settings.";
  }

  if (!args.canSuggestTrades) {
    return "Enable trade suggestions first.";
  }

  if (!agentTypeAllowsExecutable(args.agentType)) {
    if (args.agentType === "risk_monitor") {
      return "Risk monitor agents can monitor risk but cannot prepare trades. Choose Trade suggestion or Custom.";
    }
    if (args.agentType === "research_only") {
      return "Research only agents cannot prepare trades. Choose Trade suggestion, Portfolio monitor, or Custom.";
    }
    return "This agent type cannot prepare executable trades.";
  }

  if (args.binanceConnections.length === 0) {
    return "Connect a valid exchange in Settings before enabling executable trade preparation.";
  }

  if (!args.exchangeConnectionId) {
    return "Select a connected exchange to prepare executable trade drafts.";
  }

  if (!isExecutableReadyConnection(args.selectedExchange, args.exchangeConnectionId)) {
    return "Selected exchange is invalid or revoked.";
  }

  return null;
}

export function formatExchangeOptionLabel(connection: ExchangeConnectionSummary): string {
  const label = connection.label?.trim();
  const suffix = label ? label : `#${connection.id}`;
  const tradingNote = connection.can_trade ? "" : " (read-only)";
  return `Binance - ${suffix}${tradingNote}`;
}

export function mapUserAgentToFormValues(agent: UserAgentRecord): AgentFormValues {
  const prefs = new Set(agent.strategy_preferences ?? []);
  const safety = agent.safety_confirmations ?? {};

  return {
    name: agent.name,
    primary_job: agent.primary_job,
    description_prompt: agent.description_prompt,
    agent_type: agent.agent_type as AgentFormValues["agent_type"],
    can_suggest_trades: agent.can_suggest_trades,
    can_prepare_executable_trades: agent.can_prepare_executable_trades,
    symbols: (agent.symbols ?? []).join(", "),
    timeframe: (agent.timeframe ?? "1h") as AgentFormValues["timeframe"],
    risk_profile: agent.risk_profile as AgentFormValues["risk_profile"],
    max_trade_size:
      agent.max_trade_size !== null && agent.max_trade_size !== undefined
        ? String(agent.max_trade_size)
        : "",
    exchange_connection_id: agent.exchange_connection_id
      ? String(agent.exchange_connection_id)
      : "",
    strategy_trend_following: prefs.has("trend_following"),
    strategy_momentum: prefs.has("momentum"),
    strategy_mean_reversion: prefs.has("mean_reversion"),
    strategy_breakout: prefs.has("breakout"),
    strategy_risk_first: prefs.has("risk_first"),
    strategy_portfolio_rebalance: prefs.has("portfolio_rebalance"),
    safety_trading_risk: Boolean(safety.understand_trading_risk),
    safety_not_guaranteed: Boolean(safety.understand_suggestions_not_guaranteed),
    safety_must_confirm: Boolean(safety.understand_must_confirm_trades),
    safety_withdrawal_disabled: Boolean(safety.confirm_withdrawal_disabled),
    safety_not_advice: Boolean(safety.understand_not_financial_advice),
  };
}

export function buildAgentBody(values: AgentFormValues) {
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
