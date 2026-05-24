import { describe, expect, it } from "vitest";
import { ApiClientError } from "./errors";
import { displayApiError, normalizeApiError } from "./display-api-error";

describe("displayApiError", () => {
  it("uses catalog message over raw envelope message", () => {
    const result = displayApiError(
      new ApiClientError("raw upstream text", {
        status: 422,
        code: "WALLET_INSUFFICIENT_BALANCE_AFTER_FEE",
        retryable: false,
        data: { max_sendable_amount: "0.01" },
      }),
      "wallet-send",
    );
    expect(result.message).toContain("Insufficient SOL balance");
    expect(result.message).not.toContain("raw upstream");
    expect(result.hints[0]).toContain("0.01");
  });

  it("uses generic network message outside wallet-send context", () => {
    const msg = normalizeApiError(
      new ApiClientError("raw", { status: 0, code: "NETWORK_ERROR", retryable: true }),
      "default",
    );
    expect(msg).toContain("Unable to connect");
    expect(msg).not.toContain("Send preview");
  });

  it("uses send-specific network message in wallet-send context", () => {
    const msg = normalizeApiError(
      new ApiClientError("raw", { status: 0, code: "NETWORK_ERROR", retryable: true }),
      "wallet-send",
    );
    expect(msg).toContain("Send preview");
  });

  it("maps auth form 401 to invalid credentials", () => {
    const msg = normalizeApiError(
      new ApiClientError("session expired", { status: 401, code: "AUTH_UNAUTHENTICATED", retryable: false }),
      "auth-form",
    );
    expect(msg).toContain("Invalid credentials");
  });

  it("flags refresh balance for stale wallet codes", () => {
    const result = displayApiError(
      new ApiClientError("ignored", { status: 409, code: "WALLET_BALANCE_STALE", retryable: false }),
      "wallet-send",
    );
    expect(result.showRefreshBalance).toBe(true);
  });
});
