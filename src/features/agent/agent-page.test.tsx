import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import type { UserAgentRecord } from "@/lib/api/types";

const agentsQuery = vi.fn();
const runMutate = vi.fn();
const disableMutate = vi.fn();
const deleteMutate = vi.fn();
const pushToast = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

vi.mock("@/features/agent/use-agents", () => ({
  useAgentsQuery: () => agentsQuery(),
  useRunAgentMutation: () => ({ mutateAsync: runMutate, isPending: false }),
  useDisableAgentMutation: () => ({ mutateAsync: disableMutate, isPending: false }),
  useDeleteAgentMutation: () => ({ mutateAsync: deleteMutate, isPending: false }),
}));

import AgentPage from "@/features/agent/agent-page";

const sampleAgent: UserAgentRecord = {
  id: "agent-1",
  name: "BTC Watcher",
  primary_job: "Market research",
  description_prompt: "Analyze BTCUSDT",
  agent_type: "research_only",
  can_suggest_trades: false,
  can_prepare_executable_trades: false,
  risk_profile: "balanced",
  symbols: ["BTCUSDT"],
  strategy_preferences: [],
  status: "active",
};

function setAgentsQuery(
  value: Partial<ReturnType<typeof agentsQuery>> & {
    isPending?: boolean;
    isError?: boolean;
    isFetching?: boolean;
    error?: unknown;
    data?: { items: UserAgentRecord[] };
    refetch?: ReturnType<typeof vi.fn>;
  },
) {
  agentsQuery.mockReturnValue({
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    data: { items: [] },
    refetch: vi.fn(),
    ...value,
  });
}

beforeEach(() => {
  agentsQuery.mockReset();
  runMutate.mockReset();
  disableMutate.mockReset();
  deleteMutate.mockReset();
  pushToast.mockReset();
});

describe("AgentPage", () => {
  it("renders loading state", () => {
    setAgentsQuery({ isPending: true });
    render(<AgentPage />);
    expect(screen.getByText("Loading agents…")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    setAgentsQuery({ data: { items: [] } });
    render(<AgentPage />);
    expect(
      screen.getByText("No agents yet. Create your first agent to start researching markets."),
    ).toBeInTheDocument();
  });

  it("renders error state with retry message", () => {
    setAgentsQuery({
      isError: true,
      error: new ApiClientError("Agents could not be loaded.", {
        status: 500,
        code: "AGENT_LOAD_FAILED",
        retryable: true,
      }),
    });
    render(<AgentPage />);
    expect(screen.getByText("Agents could not be loaded. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("calls refetch once when retry is clicked", () => {
    const refetch = vi.fn();
    setAgentsQuery({
      isError: true,
      isFetching: false,
      refetch,
      error: new ApiClientError("Agents could not be loaded.", {
        status: 500,
        code: "AGENT_LOAD_FAILED",
        retryable: true,
      }),
    });
    render(<AgentPage />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("disables retry while fetching", () => {
    setAgentsQuery({
      isError: true,
      isFetching: true,
      error: new ApiClientError("Agents could not be loaded.", {
        status: 500,
        code: "AGENT_LOAD_FAILED",
        retryable: true,
      }),
    });
    render(<AgentPage />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
  });

  it("renders agent cards when items exist", () => {
    setAgentsQuery({ data: { items: [sampleAgent] } });
    render(<AgentPage />);
    expect(screen.getByText("BTC Watcher")).toBeInTheDocument();
  });
});
