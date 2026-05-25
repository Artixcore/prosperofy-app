import { afterEach, describe, expect, it } from "vitest";
import {
  buildSolscanUrl,
  explorerPendingLabel,
  explorerUnavailableMessage,
  resolveExplorerUrl,
  solscanLabel,
} from "./explorer-url";

describe("explorer-url", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  });

  it("prefers API explorer_url", () => {
    const url = resolveExplorerUrl({
      explorer_url: "https://solscan.io/tx/from-api",
      tx_hash: "abc",
      network: "solana",
    });
    expect(url).toBe("https://solscan.io/tx/from-api");
  });

  it("builds mainnet Solscan fallback without cluster", () => {
    process.env.NEXT_PUBLIC_SOLANA_NETWORK = "mainnet-beta";
    const url = resolveExplorerUrl({
      explorer_url: null,
      tx_hash: "hash123",
      network: "solana",
    });
    expect(url).toBe("https://solscan.io/tx/hash123");
  });

  it("builds devnet cluster param in fallback", () => {
    process.env.NEXT_PUBLIC_SOLANA_NETWORK = "devnet";
    expect(buildSolscanUrl("sig")).toBe("https://solscan.io/tx/sig?cluster=devnet");
  });

  it("returns null when no hash", () => {
    expect(
      resolveExplorerUrl({ explorer_url: null, tx_hash: null, network: "solana" }),
    ).toBeNull();
  });

  it("solscanLabel defaults to View on Solscan", () => {
    expect(solscanLabel(null)).toBe("View on Solscan");
    expect(solscanLabel("Solscan")).toBe("View on Solscan");
  });

  it("explorerPendingLabel when no hash", () => {
    expect(
      explorerPendingLabel({ explorer_url: null, tx_hash: null, network: "solana" }),
    ).toBe("Explorer pending");
  });

  it("explorerUnavailableMessage when not broadcast", () => {
    expect(
      explorerUnavailableMessage({ explorer_url: null, tx_hash: null, network: "solana" }),
    ).toContain("broadcasted");
  });
});
