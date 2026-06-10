import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateAgentForm } from "@/features/agent/components/create-agent-form";

const mockCapabilities = {
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

const mockConnections = {
  connections: [
    {
      id: "7",
      exchange: "binance",
      label: "spider",
      status: "connected",
      is_valid: true,
      can_trade: true,
      can_withdraw: false,
    },
  ],
  exchanges: [],
};

vi.mock("@/features/exchanges/use-exchange-connections", () => ({
  useExchangeConnectionsQuery: () => ({
    data: mockConnections,
    isLoading: false,
  }),
}));

vi.mock("@/features/agent/use-agents", () => ({
  useAgentCapabilitiesQuery: () => ({
    data: mockCapabilities,
    isLoading: false,
  }),
}));

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CreateAgentForm onSubmit={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("CreateAgentForm executable trades", () => {
  beforeEach(() => {
    mockCapabilities.executable_trade_preparation_enabled = true;
  });

  it("does not permanently disable executable checkbox when gates are satisfied", () => {
    renderForm();

    const executableCheckbox = screen.getByRole("checkbox", {
      name: /can prepare executable trade drafts/i,
    });
    expect(executableCheckbox).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /can suggest trades/i }));
    fireEvent.change(screen.getByLabelText(/agent type/i), {
      target: { value: "trade_suggestion" },
    });
    fireEvent.change(screen.getByLabelText(/connected exchange/i), {
      target: { value: "7" },
    });

    expect(executableCheckbox).not.toBeDisabled();
  });

  it("shows helper when trade suggestions are not enabled", () => {
    renderForm();
    expect(screen.getByText(/enable trade suggestions first/i)).toBeInTheDocument();
  });

  it("shows safety confirmations when executable drafts are checked", () => {
    renderForm();

    fireEvent.click(screen.getByRole("checkbox", { name: /can suggest trades/i }));
    fireEvent.change(screen.getByLabelText(/agent type/i), {
      target: { value: "trade_suggestion" },
    });
    fireEvent.change(screen.getByLabelText(/connected exchange/i), {
      target: { value: "7" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /can prepare executable trade drafts/i }),
    );

    expect(
      screen.getByText(/only prepare trade drafts, not guarantee profit/i),
    ).toBeInTheDocument();
  });
});
