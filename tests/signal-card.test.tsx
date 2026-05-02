import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SignalCard } from "@/components/agents/signal-card";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SignalCard", () => {
  it("shows elevated risk tone for high risk_score and renders disclaimer text safely", () => {
    render(
      <SignalCard
        signal={{
          id: 42,
          agent_key: "signal",
          market_type: "crypto",
          symbol: "BTC",
          direction: "long",
          confidence_score: 65,
          risk_score: 82,
          timeframe: "4h",
          status: "active",
          reasoning: '<script>alert(1)</script>Momentum narrative.',
          disclaimer: "Past performance does not guarantee future results.",
        }}
      />,
    );
    expect(screen.getByText(/Risk 82/i)).toBeInTheDocument();
    expect(screen.getByText(/Past performance/i)).toBeInTheDocument();
    expect(screen.getByText(/<script>/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
