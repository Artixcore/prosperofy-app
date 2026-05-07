import { describe, expect, it } from "vitest";
import {
  isMetaMaskConnected,
  isPhantomConnected,
  metaMaskWallet,
  phantomWallet,
  primaryWalletAddress,
  shouldEnableSend,
  shouldShowActivateWfl,
  wflWalletState,
} from "./wallet-derive";
import type { ConnectedWallet, WalletOverview } from "@/lib/api/types";

function makeOverview(partial: Partial<WalletOverview>): WalletOverview {
  return {
    wfl_wallet: null,
    connected_wallets: [],
    supported_chains: ["solana", "ethereum", "bitcoin"],
    recent_activity: [],
    ...partial,
  };
}

function makeConnected(partial: Partial<ConnectedWallet>): ConnectedWallet {
  return {
    id: "1",
    provider: "phantom",
    address: "So11111111111111111111111111111111111111111",
    chain_type: "solana",
    network: null,
    label: null,
    is_primary: false,
    last_verified_at: null,
    created_at: null,
    updated_at: null,
    ...partial,
  };
}

describe("wflWalletState", () => {
  it("returns missing when overview is null/undefined", () => {
    expect(wflWalletState(null).status).toBe("missing");
    expect(wflWalletState(undefined).status).toBe("missing");
    expect(wflWalletState(null).exists).toBe(false);
  });

  it("returns missing when wfl_wallet is null", () => {
    expect(wflWalletState(makeOverview({ wfl_wallet: null })).status).toBe("missing");
  });

  it("normalizes active/pending/failed lifecycle statuses", () => {
    for (const status of ["active", "pending", "failed"] as const) {
      const overview = makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status,
          public_solana_address: null,
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      });
      expect(wflWalletState(overview).status).toBe(status);
      expect(wflWalletState(overview).exists).toBe(true);
    }
  });

  it("treats unknown backend status as pending so we never falsely show failure UI", () => {
    const overview = makeOverview({
      wfl_wallet: {
        id: 1,
        wallet_type: "wfl_internal",
        status: "provisioning",
        public_solana_address: null,
        public_ethereum_address: null,
        public_bitcoin_address: null,
      },
    });
    expect(wflWalletState(overview).status).toBe("pending");
  });

  it("exposes all three public addresses", () => {
    const overview = makeOverview({
      wfl_wallet: {
        id: 1,
        wallet_type: "wfl_internal",
        status: "active",
        public_solana_address: "Sol1",
        public_ethereum_address: "0xeth",
        public_bitcoin_address: "bc1q",
      },
    });
    expect(wflWalletState(overview).addresses).toEqual({
      solana: "Sol1",
      ethereum: "0xeth",
      bitcoin: "bc1q",
    });
  });
});

describe("phantomWallet / metaMaskWallet", () => {
  it("returns null when no wallet of the given provider is connected", () => {
    expect(phantomWallet(makeOverview({ connected_wallets: [] }))).toBeNull();
    expect(metaMaskWallet(makeOverview({ connected_wallets: [] }))).toBeNull();
  });

  it("picks the most recently verified wallet when multiple exist", () => {
    const older = makeConnected({
      id: "10",
      provider: "phantom",
      address: "OldAddr",
      last_verified_at: "2024-01-01T00:00:00Z",
    });
    const newer = makeConnected({
      id: "11",
      provider: "phantom",
      address: "NewAddr",
      last_verified_at: "2024-06-01T00:00:00Z",
    });
    const overview = makeOverview({ connected_wallets: [older, newer] });
    expect(phantomWallet(overview)?.id).toBe("11");
  });

  it("treats provider names case-insensitively", () => {
    const overview = makeOverview({
      connected_wallets: [makeConnected({ provider: "Phantom" })],
    });
    expect(isPhantomConnected(overview)).toBe(true);
  });
});

describe("isPhantomConnected / isMetaMaskConnected", () => {
  it("isPhantomConnected reflects presence of a phantom wallet", () => {
    expect(isPhantomConnected(makeOverview({ connected_wallets: [] }))).toBe(false);
    expect(
      isPhantomConnected(
        makeOverview({ connected_wallets: [makeConnected({ provider: "phantom" })] }),
      ),
    ).toBe(true);
  });

  it("isMetaMaskConnected only returns true for metamask provider", () => {
    expect(
      isMetaMaskConnected(
        makeOverview({ connected_wallets: [makeConnected({ provider: "phantom" })] }),
      ),
    ).toBe(false);
    expect(
      isMetaMaskConnected(
        makeOverview({
          connected_wallets: [
            makeConnected({ provider: "metamask", chain_type: "evm", address: "0xabc" }),
          ],
        }),
      ),
    ).toBe(true);
  });
});

describe("shouldShowActivateWfl / shouldEnableSend", () => {
  it("hides Activate when wallet is active or pending", () => {
    for (const status of ["active", "pending"] as const) {
      const overview = makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status,
          public_solana_address: null,
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      });
      expect(shouldShowActivateWfl(overview)).toBe(false);
    }
  });

  it("shows Activate when wallet is missing or failed", () => {
    expect(shouldShowActivateWfl(makeOverview({ wfl_wallet: null }))).toBe(true);
    const failed = makeOverview({
      wfl_wallet: {
        id: 1,
        wallet_type: "wfl_internal",
        status: "failed",
        public_solana_address: null,
        public_ethereum_address: null,
        public_bitcoin_address: null,
      },
    });
    expect(shouldShowActivateWfl(failed)).toBe(true);
  });

  it("only enables Send when wallet is active", () => {
    for (const [status, expected] of [
      ["active", true],
      ["pending", false],
      ["failed", false],
    ] as const) {
      const overview = makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status,
          public_solana_address: null,
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      });
      expect(shouldEnableSend(overview)).toBe(expected);
    }
    expect(shouldEnableSend(makeOverview({ wfl_wallet: null }))).toBe(false);
  });
});

describe("primaryWalletAddress", () => {
  it("prefers Solana > Ethereum > Bitcoin", () => {
    const overview = makeOverview({
      wfl_wallet: {
        id: 1,
        wallet_type: "wfl_internal",
        status: "active",
        public_solana_address: "Sol1",
        public_ethereum_address: "0xeth",
        public_bitcoin_address: "bc1q",
      },
    });
    expect(primaryWalletAddress(overview)).toEqual({ network: "solana", address: "Sol1" });
  });

  it("falls through when earlier networks have no address", () => {
    const overview = makeOverview({
      wfl_wallet: {
        id: 1,
        wallet_type: "wfl_internal",
        status: "active",
        public_solana_address: null,
        public_ethereum_address: null,
        public_bitcoin_address: "bc1q",
      },
    });
    expect(primaryWalletAddress(overview)).toEqual({ network: "bitcoin", address: "bc1q" });
  });

  it("returns null when no addresses are set", () => {
    expect(primaryWalletAddress(makeOverview({ wfl_wallet: null }))).toBeNull();
  });
});
