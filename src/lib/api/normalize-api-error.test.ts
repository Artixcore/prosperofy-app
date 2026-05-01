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

  it("maps network and timeout", () => {
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 0, code: "NETWORK_ERROR", retryable: true })),
    ).toContain("Network connection failed");
    expect(
      normalizeApiError(new ApiClientError("raw", { status: 0, code: "TIMEOUT", retryable: true })),
    ).toContain("too long");
  });
});
