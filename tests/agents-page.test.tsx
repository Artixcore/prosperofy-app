import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import AgentsOverviewPage from "@/app/(dashboard)/agents/page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/features/agents/use-agents-api", () => ({
  useAgentsDashboardQuery: () => ({
    isLoading: false,
    isError: false,
    data: {
      agents_enabled_count: 8,
      latest_signals: [],
      latest_signal: null,
      reward_summary: { pending: 0, claimable: 0, claimed: 0 },
    },
  }),
  useAgentsCatalogQuery: () => ({
    isLoading: false,
    isError: false,
    data: {
      agents: [
        {
          id: 1,
          key: "market_research",
          name: "Market research",
          category: "research",
          description: "Test agent",
          enabled: true,
          supported_markets: ["crypto"],
          supported_timeframes: ["1h"],
        },
      ],
    },
  }),
}));

describe("AgentsOverviewPage", () => {
  it("renders KPI strip, disclaimer, and catalog heading", () => {
    render(<AgentsOverviewPage />);
    expect(screen.getByRole("heading", { name: /AI Agents/i })).toBeInTheDocument();
    expect(screen.getByText(/Agents enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/not financial advice/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Available agents/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open agent/i })).toHaveAttribute(
      "href",
      "/agents/market_research",
    );
  });
});
