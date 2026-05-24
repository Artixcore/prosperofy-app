import { describe, expect, it } from "vitest";
import { ApiClientError } from "./errors";
import { normalizeApiError } from "./normalize-api-error";

describe("normalizeApiError", () => {
  it("maps common api statuses", () => {
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 401, code: "UNAUTHENTICATED", retryable: false })),
    ).toContain("session expired");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 403, code: "FORBIDDEN", retryable: false })),
    ).toContain("permission");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 429, code: "RATE_LIMITED", retryable: true })),
    ).toContain("Too many requests");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 500, code: "SERVER_ERROR", retryable: true })),
    ).toContain("server");
  });

  it("maps wallet-specific error codes on 422", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 422,
          code: "WALLET_CHALLENGE_INVALID",
          retryable: false,
        }),
      ),
    ).toContain("expired");
    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 422,
          code: "WALLET_VERIFY_FAILED",
          retryable: false,
        }),
      ),
    ).toContain("signature verification failed");
    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 422,
          code: "VALIDATION_ERROR",
          retryable: false,
          fieldErrors: { signature: ["The signature field is required."] },
        }),
      ),
    ).toBe("The signature field is required.");
  });

  it("maps WALLET_ALREADY_LINKED on 409", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 409,
          code: "WALLET_ALREADY_LINKED",
          retryable: false,
        }),
      ),
    ).toContain("already linked");
  });

  it("maps wallet load failures to a friendly message", () => {
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 503, code: "WALLET_UNAVAILABLE", retryable: true })),
    ).toContain("Wallet service");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 500, code: "WALLET_ERROR", retryable: false })),
    ).toContain("wallet data");
  });

  it("maps session expired http codes", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", { status: 419, code: "HTTP_SESSION_EXPIRED", retryable: false }),
      ),
    ).toContain("session expired");
  });

  it("maps granular wallet challenge codes", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", { status: 422, code: "WALLET_CHALLENGE_EXPIRED", retryable: false }),
      ),
    ).toContain("expired");
    expect(
      normalizeApiError(new ApiClientError("ignored", { status: 422, code: "WALLET_CHALLENGE_USED", retryable: false })),
    ).toContain("already used");
  });

  it("maps network and timeout to context-neutral copy (no wallet-connection wording)", () => {
    const networkMessage = normalizeApiError(
      new ApiClientError("raw", { status: 0, code: "NETWORK_ERROR", retryable: true }),
    );
    expect(networkMessage).toContain("Unable to connect");
    // Regression guard: the old wording incorrectly framed every network error as a
    // wallet-connection failure, which is wrong for balance refresh, listing, etc.
    expect(networkMessage).not.toMatch(/Wallet connection failed/i);
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 0, code: "TIMEOUT", retryable: true })),
    ).toContain("timed out");
  });

  it("maps send-preview specific errors", () => {
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 409, code: "WALLET_BALANCE_NOT_SYNCED", retryable: false })),
    ).toContain("refresh your wallet balance");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 409, code: "WALLET_BALANCE_STALE", retryable: false })),
    ).toContain("refresh your wallet balance");
    expect(
      normalizeApiError(
        new ApiClientError("raw", { status: 422, code: "WALLET_INSUFFICIENT_BALANCE_AFTER_FEE", retryable: false }),
      ),
    ).toContain("Insufficient SOL balance");
  });

  it("maps balance-refresh upstream errors to specific user-friendly copy", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 503,
          code: "WALLET_UPSTREAM_UNAVAILABLE",
          retryable: true,
        }),
      ),
    ).toContain("Solana network data is temporarily unavailable");

    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 502,
          code: "WALLET_SYNC_FAILED",
          retryable: true,
        }),
      ),
    ).toContain("Wallet balance service is temporarily unavailable");

    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 422,
          code: "WALLET_ADDRESS_MISSING",
          retryable: false,
        }),
      ),
    ).toContain("Solana receive address is not available");

    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 404,
          code: "WALLET_NOT_FOUND",
          retryable: false,
        }),
      ),
    ).toContain("No WFL Wallet found");

    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 409,
          code: "WALLET_NOT_ACTIVE",
          retryable: true,
        }),
      ),
    ).toContain("not active yet");

    expect(
      normalizeApiError(
        new ApiClientError("ignored", {
          status: 429,
          code: "WALLET_RATE_LIMIT",
          retryable: true,
        }),
      ),
    ).toContain("Too many balance refreshes");
  });

  it("maps wallet signing cancelled sentinel", () => {
    expect(normalizeApiError(new Error("Wallet signing was cancelled."))).toBe("Wallet signing was cancelled.");
  });

  it("maps missing extension errors", () => {
    expect(normalizeApiError(new Error("MetaMask not available. Install MetaMask."))).toContain("MetaMask is not installed");
    expect(normalizeApiError(new Error("Phantom not available. Install the Phantom extension."))).toContain(
      "Phantom is not installed",
    );
  });

  it("maps AI service error codes", () => {
    expect(
      normalizeApiError(
        new ApiClientError("ignored", { status: 503, code: "AI_UNAVAILABLE", retryable: true }),
      ),
    ).toContain("temporarily unavailable");
    expect(
      normalizeApiError(
        new ApiClientError("ignored", { status: 503, code: "AI_NOT_CONFIGURED", retryable: false }),
      ),
    ).toContain("not available");
    expect(
      normalizeApiError(
        new ApiClientError("ignored", { status: 503, code: "AI_BUSINESS_ERROR", retryable: false }),
      ),
    ).toContain("could not complete");
  });
});
