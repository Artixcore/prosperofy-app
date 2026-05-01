import { describe, expect, it, vi } from "vitest";
import { connectMetaMaskFlow, connectPhantomFlow } from "./wallet-adapters";

describe("wallet adapters", () => {
  it("renders Phantom unavailable state via error", async () => {
    (globalThis as { window: unknown }).window = {};
    await expect(
      connectPhantomFlow(
        async () => ({ challenge_id: 1, message: "m" }),
        async () => ({}),
      ),
    ).rejects.toThrow("Phantom not available");
  });

  it("renders MetaMask unavailable state via error", async () => {
    (globalThis as { window: unknown }).window = {};
    await expect(
      connectMetaMaskFlow(
        async () => ({ challenge_id: 1, message: "m" }),
        async () => ({}),
      ),
    ).rejects.toThrow("MetaMask not available");
  });

  it("connect flow success for MetaMask calls API", async () => {
    const requestMock = vi.fn()
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockResolvedValueOnce("0xabcd");
    (globalThis as { window: unknown }).window = {
      ethereum: { request: requestMock },
    };
    const connectApi = vi.fn().mockResolvedValue({});
    await connectMetaMaskFlow(
      async () => ({ challenge_id: 10, message: "Sign me" }),
      connectApi,
    );
    expect(connectApi).toHaveBeenCalledTimes(1);
  });

  it("connect flow handles malformed signature error", async () => {
    const requestMock = vi.fn()
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockResolvedValueOnce("invalid");
    (globalThis as { window: unknown }).window = {
      ethereum: { request: requestMock },
    };
    await expect(
      connectMetaMaskFlow(
        async () => ({ challenge_id: 10, message: "Sign me" }),
        async () => ({}),
      ),
    ).rejects.toThrow("Unexpected signature format");
  });

  it("maps MetaMask user rejection to cancelled signing error", async () => {
    const requestMock = vi.fn().mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"]).mockRejectedValueOnce({
      code: 4001,
      message: "User rejected the request.",
    });
    (globalThis as { window: unknown }).window = {
      ethereum: { request: requestMock },
    };
    await expect(
      connectMetaMaskFlow(
        async () => ({ challenge_id: 10, message: "Sign me" }),
        async () => ({}),
      ),
    ).rejects.toThrow("Wallet signing was cancelled.");
  });
});
