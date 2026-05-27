import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaAnalysisPage from "@/app/(dashboard)/agents/pa/page";

const mutateAsync = vi.fn();

vi.mock("@/features/pa/use-pa-api", () => ({
  usePaAnalyzeMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/behavior/use-behavior-tracking", () => ({
  useBehaviorTracking: () => ({
    recordEvent: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

describe("PaAnalysisPage", () => {
  it("shows PA title and renders analysis result after submit", async () => {
    mutateAsync.mockResolvedValueOnce({
      model: "PA 3.0.0",
      engine_version: "3.0.0",
      symbol: "SOLUSDT",
      asset_class: "crypto",
      timeframe: "15m",
      price: "170.42",
      signal: { action: "watch", confidence: 0.72, risk_level: "medium" },
      regime: { name: "bullish_trend", confidence: 0.76 },
      warnings: ["Signals are informational only and not financial advice."],
    });

    render(<PaAnalysisPage />);

    expect(screen.getByText(/PA 3\.0\.0 Market Intelligence Engine/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Run PA 3\.0\.0 Analysis/i }));

    await waitFor(() => {
      expect(screen.getByText(/Market regime/i)).toBeInTheDocument();
      expect(screen.getByText(/bullish trend/i)).toBeInTheDocument();
    });

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: "SOLUSDT",
        timeframe: "15m",
        asset_class: "crypto",
      }),
    );
  });
});
