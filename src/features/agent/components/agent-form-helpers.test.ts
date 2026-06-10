import { describe, expect, it } from "vitest";
import {
  agentTypeAllowsExecutable,
  buildAgentBody,
  filterBinanceConnections,
  getExecutableDisabledReason,
  isExecutableReadyConnection,
  mapUserAgentToFormValues,
} from "@/features/agent/components/agent-form-helpers";
import type { AgentCapabilities, ExchangeConnectionSummary, UserAgentRecord } from "@/lib/api/types";

const baseCapabilities: AgentCapabilities = {
  agents_enabled: true,
  trade_suggestions_enabled: true,
  executable_trade_preparation_enabled: true,
  trade_execution_enabled: false,
  binance_trading_enabled: false,
  requires_exchange_connection: true,
  requires_risk_confirmation: true,
  has_valid_binance_connection: true,
  has_trading_binance_connection: true,
  disclaimer: "Not financial advice.",
};

const tradingConnection: ExchangeConnectionSummary = {
  id: "1",
  exchange: "binance",
  label: "spider",
  status: "connected",
  is_valid: true,
  can_trade: true,
  can_withdraw: false,
};

describe("agent-form-helpers", () => {
  it("filters connected valid binance connections", () => {
    const result = filterBinanceConnections([
      tradingConnection,
      { id: "2", exchange: "binance", status: "revoked", is_valid: false },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("requires trading permission for executable-ready connection", () => {
    expect(isExecutableReadyConnection(tradingConnection, "1")).toBe(true);
    expect(
      isExecutableReadyConnection({ ...tradingConnection, can_trade: false }, "1"),
    ).toBe(false);
  });

  it("allows executable agent types", () => {
    expect(agentTypeAllowsExecutable("trade_suggestion")).toBe(true);
    expect(agentTypeAllowsExecutable("risk_monitor")).toBe(false);
  });

  it("returns platform disabled reason", () => {
    expect(
      getExecutableDisabledReason({
        capabilities: { ...baseCapabilities, executable_trade_preparation_enabled: false },
        capabilitiesLoading: false,
        canSuggestTrades: true,
        agentType: "trade_suggestion",
        exchangeConnectionId: "1",
        binanceConnections: [tradingConnection],
        selectedExchange: tradingConnection,
      }),
    ).toContain("disabled by platform settings");
  });

  it("returns suggest-trades-first reason", () => {
    expect(
      getExecutableDisabledReason({
        capabilities: baseCapabilities,
        capabilitiesLoading: false,
        canSuggestTrades: false,
        agentType: "trade_suggestion",
        exchangeConnectionId: "1",
        binanceConnections: [tradingConnection],
        selectedExchange: tradingConnection,
      }),
    ).toBe("Enable trade suggestions first.");
  });

  it("builds agent payload with safety confirmations", () => {
    const body = buildAgentBody({
      name: "Test",
      primary_job: "Market research",
      description_prompt: "Analyze BTC",
      agent_type: "trade_suggestion",
      can_suggest_trades: true,
      can_prepare_executable_trades: true,
      symbols: "BTCUSDT",
      timeframe: "1h",
      risk_profile: "balanced",
      max_trade_size: "100",
      exchange_connection_id: "1",
      safety_trading_risk: true,
      safety_not_guaranteed: true,
      safety_must_confirm: true,
      safety_withdrawal_disabled: true,
      safety_not_advice: true,
    });

    expect(body.can_prepare_executable_trades).toBe(true);
    expect(body.exchange_connection_id).toBe(1);
    expect(body.safety_confirmations?.understand_trading_risk).toBe(true);
  });

  it("maps user agent record to form values", () => {
    const agent: UserAgentRecord = {
      id: "a1",
      name: "Watcher",
      primary_job: "Market research",
      description_prompt: "Analyze",
      agent_type: "trade_suggestion",
      can_suggest_trades: true,
      can_prepare_executable_trades: true,
      risk_profile: "balanced",
      symbols: ["BTCUSDT"],
      timeframe: "1h",
      strategy_preferences: ["momentum"],
      max_trade_size: "50",
      status: "active",
      exchange_connection_id: 3,
      safety_confirmations: {
        understand_trading_risk: true,
        understand_suggestions_not_guaranteed: true,
        understand_must_confirm_trades: true,
        confirm_withdrawal_disabled: true,
        understand_not_financial_advice: true,
      },
    };

    const values = mapUserAgentToFormValues(agent);
    expect(values.exchange_connection_id).toBe("3");
    expect(values.strategy_momentum).toBe(true);
    expect(values.safety_trading_risk).toBe(true);
  });
});
