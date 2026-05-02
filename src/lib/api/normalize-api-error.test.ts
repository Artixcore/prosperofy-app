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
    ).toBe("Wallet verification service is temporarily unavailable. Please try again shortly.");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 500, code: "wallet_error", retryable: false })),
    ).toBe("Wallet verification service is temporarily unavailable. Please try again shortly.");
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

  it("maps network and timeout", () => {
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 0, code: "NETWORK_ERROR", retryable: true })),
    ).toContain("server could not be reached");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 0, code: "TIMEOUT", retryable: true })),
    ).toContain("too long");
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
});
