import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiRecommendationRecord } from "@/lib/api/types";

const createMutate = vi.fn();
const saveMutate = vi.fn();
const dismissMutate = vi.fn();
const pushToast = vi.fn();

let createPending = false;
let latestItems: AiRecommendationRecord[] = [];
let savedItems: AiRecommendationRecord[] = [];

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

vi.mock("@/features/wallets/use-wallet-mutations", () => ({
  useWalletControlCenterQuery: () => ({
    data: {
      sub_wallets: [
        { type: "save", name: "Save", balance: "10.00", currency: "WFL", status: "ready" },
        { type: "invest", name: "Invest", balance: "5.00", currency: "WFL", status: "ready" },
        { type: "spend", name: "Spend", balance: "2.00", currency: "WFL", status: "ready" },
      ],
    },
  }),
}));

vi.mock("@/features/billing/use-current-subscription", () => ({
  useCurrentSubscription: () => ({
    data: { plan_name: "Free", metadata: { ai_access: "limited" } },
  }),
}));

vi.mock("@/features/ai/use-ai-actions", () => ({
  useAiRecommendationsQuery: (params?: { status?: string }) => ({
    data: {
      items: params?.status === "saved" ? savedItems : latestItems,
      pagination: { current_page: 1, per_page: 5, total: 0, last_page: 1 },
    },
  }),
  useCreateAiActionMutation: () => ({
    mutateAsync: createMutate,
    isPending: createPending,
  }),
  useSaveAiRecommendationMutation: () => ({
    mutateAsync: saveMutate,
    isPending: false,
    variables: undefined,
  }),
  useDismissAiRecommendationMutation: () => ({
    mutateAsync: dismissMutate,
    isPending: false,
    variables: undefined,
  }),
}));

import AiActionCenterPage from "@/features/ai/ai-action-center-page";

const sampleRecommendation: AiRecommendationRecord = {
  id: "rec-1",
  type: "analyze_save_wallet",
  title: "Save Wallet insight",
  summary: "Add funds to your Save Wallet before exploring yield options.",
  status: "ready",
  risk_level: "low",
  confidence_score: 85,
  recommended_actions: [
    { label: "Review idea", action: "view_details" },
    { label: "Save idea", action: "save" },
    { label: "Dismiss", action: "dismiss" },
  ],
  disclaimer: "This is not financial advice. You can lose money.",
};

describe("AiActionCenterPage", () => {
  beforeEach(() => {
    createMutate.mockReset();
    saveMutate.mockReset();
    dismissMutate.mockReset();
    pushToast.mockReset();
    createPending = false;
    latestItems = [];
    savedItems = [];
    createMutate.mockResolvedValue({ recommendation: sampleRecommendation });
    saveMutate.mockResolvedValue({ recommendation: { ...sampleRecommendation, status: "saved" } });
    dismissMutate.mockResolvedValue({ recommendation: { ...sampleRecommendation, status: "dismissed" } });
  });

  it("renders page title and action cards", () => {
    render(<AiActionCenterPage />);
    expect(screen.getByRole("heading", { name: "AI Action Center" })).toBeInTheDocument();
    expect(screen.getByText("AI Savings Advisor")).toBeInTheDocument();
    expect(screen.getByText("AI Investment Agent")).toBeInTheDocument();
    expect(screen.getByText("AI Spending Assistant")).toBeInTheDocument();
    expect(screen.getByText("AI Risk Monitor")).toBeInTheDocument();
    expect(screen.getByText("AI Rewards Optimizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze Save Wallet" })).toBeInTheDocument();
  });

  it("creates recommendation when action is clicked", async () => {
    render(<AiActionCenterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze Save Wallet" }));
    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith({
        action_type: "analyze_save_wallet",
        context: { wallet_type: "save" },
      });
    });
    expect(await screen.findByText(sampleRecommendation.summary)).toBeInTheDocument();
    expect(screen.getByText(sampleRecommendation.disclaimer)).toBeInTheDocument();
  });

  it("shows error when action fails", async () => {
    createMutate.mockRejectedValue(new Error("network"));
    render(<AiActionCenterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Suggest allocation" }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("disables action buttons while loading", () => {
    createPending = true;
    render(<AiActionCenterPage />);
    expect(screen.getByRole("button", { name: "Analyze Save Wallet" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Suggest allocation" })).toBeDisabled();
  });

  it("save and dismiss buttons work on active recommendation", async () => {
    render(<AiActionCenterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Analyze Save Wallet" }));
    await screen.findByText(sampleRecommendation.summary);

    fireEvent.click(screen.getByRole("button", { name: "Save idea" }));
    await waitFor(() => expect(saveMutate).toHaveBeenCalledWith("rec-1"));

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(dismissMutate).toHaveBeenCalledWith("rec-1"));
  });

  it("shows empty state when no active recommendation", () => {
    render(<AiActionCenterPage />);
    expect(
      screen.getByText("No recommendation yet. Choose an action above to get started."),
    ).toBeInTheDocument();
  });
});
