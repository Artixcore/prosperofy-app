import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMarketQuote } from "./use-market-quote";

vi.mock("@/lib/auth/session-context", () => ({
  useAuth: () => ({
    token: "test-token",
    authReady: true,
    isAuthenticated: true,
  }),
}));

vi.mock("@/lib/api/client", () => ({
    laravelFetch: vi.fn(async () => ({
      symbol: "BTCUSD",
      mid: "100",
      price: "100",
      provider: "coingecko",
      is_live: true,
      source: "rest",
    })),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useMarketQuote", () => {
  it("loads quote data from Laravel envelope payload", async () => {
    const { result } = renderHook(() => useMarketQuote("crypto", "BTCUSD"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.mid).toBe("100");
    expect(result.current.data?.provider).toBe("coingecko");
  });
});
