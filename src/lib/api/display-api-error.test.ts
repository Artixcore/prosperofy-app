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

  it("uses confirm-specific message for 504 gateway timeout", () => {
    const result = displayApiError(
      new ApiClientError("gateway timeout", { status: 504, code: "NON_JSON_RESPONSE", retryable: false }),
      "wallet-send-confirm",
    );
    expect(result.message).toContain("check wallet history");
    expect(result.retryable).toBe(false);
  });

  it("uses blockchain unavailable message for wallet rpc timeout on confirm", () => {
    const result = displayApiError(
      new ApiClientError("timeout", { status: 503, code: "WALLET_RPC_TIMEOUT", retryable: true }),
      "wallet-send-confirm",
    );
    expect(result.message).toContain("Blockchain network is temporarily unavailable");
  });

  it("uses session expired message for confirm 401", () => {
    const result = displayApiError(
      new ApiClientError("unauth", { status: 401, code: "AUTH_UNAUTHENTICATED", retryable: false }),
      "wallet-send-confirm",
    );
    expect(result.message).toContain("Session expired");
  });

  it("uses confirm timeout copy for client abort", () => {
    const result = displayApiError(
      new ApiClientError("timeout", { status: 0, code: "TIMEOUT", retryable: true }),
      "wallet-send-confirm",
    );
    expect(result.message).toContain("check wallet history");
    expect(result.retryable).toBe(false);
  });
});
