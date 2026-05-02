import { describe, expect, it, vi } from "vitest";
import type { WalletChallengeResponse } from "@/lib/api/types";
import { connectMetaMaskFlow, connectPhantomFlow } from "./wallet-adapters";

const phantomPk = "So11111111111111111111111111111111111111111";

function phantomWindow(signMessageImpl?: () => Promise<{ signature: Uint8Array }>) {
  return {
    solana: {
      signMessage: signMessageImpl ?? vi.fn().mockResolvedValue({ signature: new Uint8Array(64) }),
      publicKey: { toString: () => phantomPk },
      connect: vi.fn(),
    },
  };
}

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

  it("rejects Phantom flow when challenge_id is missing", async () => {
    (globalThis as { window: unknown }).window = phantomWindow();
    await expect(
      connectPhantomFlow(
        async () => ({ message: "m" }) as WalletChallengeResponse,
        async () => ({}),
      ),
    ).rejects.toThrow("Wallet connection challenge expired. Please try again.");
  });

  it("rejects MetaMask flow when challenge_id is missing", async () => {
    const requestMock = vi.fn().mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"]);
    (globalThis as { window: unknown }).window = {
      ethereum: { request: requestMock },
    };
    await expect(
      connectMetaMaskFlow(
        async () => ({ message: "Sign me" }) as WalletChallengeResponse,
        async () => ({}),
      ),
    ).rejects.toThrow("Wallet connection challenge expired. Please try again.");
  });

  it("requests challenge with normalized ethereum address", async () => {
    const fetchChallenge = vi.fn().mockResolvedValue({ challenge_id: 10, message: "Sign me" });
    const requestMock = vi
      .fn()
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockResolvedValueOnce("0xabcd");
    (globalThis as { window: unknown }).window = {
      ethereum: { request: requestMock },
    };
    const connectApi = vi.fn().mockResolvedValue({});
    await connectMetaMaskFlow(fetchChallenge, connectApi);
    expect(fetchChallenge).toHaveBeenCalledWith({
      provider: "metamask",
      chain: "ethereum",
      address: "0x0000000000000000000000000000000000000001",
    });
    expect(connectApi).toHaveBeenCalledTimes(1);
  });

  it("connect flow success for Phantom calls challenge with publicKey", async () => {
    const fetchChallenge = vi.fn().mockResolvedValue({ challenge_id: 10, message: "Sign me" });
    (globalThis as { window: unknown }).window = phantomWindow();
    const connectApi = vi.fn().mockResolvedValue({});
    await connectPhantomFlow(fetchChallenge, connectApi);
    expect(fetchChallenge).toHaveBeenCalledWith({
      provider: "phantom",
      chain: "solana",
      publicKey: phantomPk,
    });
    expect(connectApi).toHaveBeenCalledTimes(1);
  });

  it("connect flow handles malformed signature error", async () => {
    const requestMock = vi
      .fn()
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
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
    const requestMock = vi
      .fn()
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockResolvedValueOnce(["0x0000000000000000000000000000000000000001"])
      .mockRejectedValueOnce({
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
