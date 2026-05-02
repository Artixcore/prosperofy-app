import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgentRunForm } from "@/components/agents/agent-run-form";

const mutateAsync = vi.fn();

vi.mock("@/features/agents/use-agents-api", () => ({
  useRunAgentMutation: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
    data: undefined,
  }),
}));

describe("AgentRunForm", () => {
  it("requires symbols and submits normalized payload", async () => {
    mutateAsync.mockResolvedValueOnce({ ok: true });

    render(<AgentRunForm agentKey="crypto_research" defaultSymbols="" showCountryField={false} />);

    const submit = screen.getByRole("button", { name: /Generate analysis/i });
    fireEvent.click(submit);
    await waitFor(() => expect(mutateAsync).not.toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Symbols \(comma or space separated\)/i), {
      target: { value: "BTC ETH" },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          agent_key: "crypto_research",
          symbols: ["BTC", "ETH"],
        }),
      ),
    );
  });
});
