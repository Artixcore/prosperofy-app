import { parseEnvelope } from "./envelope";
import { ApiClientError } from "./errors";

export const AUTH_UNAUTHORIZED_EVENT = "prosperofy:auth-unauthorized";

function getBaseUrl(): string {
  const base =
    typeof process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL === "string"
      ? process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL.trim()
      : "";
  if (!base) {
    throw new Error("NEXT_PUBLIC_LARAVEL_API_BASE_URL is not configured.");
  }
  return base.replace(/\/+$/, "");
}

function emitUnauthorizedEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

function pickFirstHeader(res: Response, names: string[]): string | undefined {
  for (const name of names) {
    const value = res.headers.get(name);
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

export type LaravelFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  expectNoContent?: boolean;
};

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined" || !document.cookie) return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

function isMutatingMethod(method: LaravelFetchOptions["method"]): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function logApiResponseIssue(details: {
  endpoint: string;
  status: number;
  contentType: string;
  requestId?: string;
  correlationId?: string;
  code: string;
}): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn("[api-client] response issue", details);
}

/**
 * Typed fetch to Laravel core only. Expects Prosperofy JSON envelope on success bodies.
 */
export async function laravelFetch<T>(
  path: string,
  options: LaravelFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, token, signal, expectNoContent = false } = options;
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-Correlation-Id": randomId(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let initBody: string | undefined;
  if (body !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    initBody = JSON.stringify(body);
  }

  if (isMutatingMethod(method)) {
    const xsrfToken = readCookie("XSRF-TOKEN");
    if (xsrfToken && !headers["X-XSRF-TOKEN"]) {
      headers["X-XSRF-TOKEN"] = xsrfToken;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: initBody,
      signal,
      credentials: "include",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new ApiClientError("Unable to connect. Please try again.", {
      status: 0,
      code: "NETWORK_ERROR",
      retryable: true,
    });
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const contentLength = res.headers.get("content-length");
  const hasExplicitZeroLength = contentLength === "0";
  const requestId = pickFirstHeader(res, ["x-request-id", "x-amzn-requestid", "x-amz-request-id"]);
  const correlationId = pickFirstHeader(res, ["x-correlation-id"]);

  if (res.status === 401) {
    emitUnauthorizedEvent();
    throw new ApiClientError("Session expired. Please sign in again.", {
      status: 401,
      code: "UNAUTHENTICATED",
      retryable: false,
      requestId,
      correlationId,
    });
  }

  if (res.status === 419) {
    throw new ApiClientError("Session expired. Please try again.", {
      status: 419,
      code: "HTTP_SESSION_EXPIRED",
      retryable: false,
      requestId,
      correlationId,
    });
  }

  if (expectNoContent && (res.status === 204 || hasExplicitZeroLength)) {
    return {} as T;
  }

  if (res.status === 204) {
    return {} as T;
  }

  if (!isJson) {
    if (res.redirected || (res.status >= 300 && res.status < 400)) {
      logApiResponseIssue({
        endpoint: path,
        status: res.status,
        contentType,
        requestId,
        correlationId,
        code: "UNEXPECTED_REDIRECT",
      });
      throw new ApiClientError("Request could not be completed. Please sign in again.", {
        status: res.status,
        code: "UNEXPECTED_REDIRECT",
        retryable: false,
        requestId,
        correlationId,
      });
    }

    if (contentType.includes("text/html")) {
      logApiResponseIssue({
        endpoint: path,
        status: res.status,
        contentType,
        requestId,
        correlationId,
        code: "HTML_RESPONSE",
      });
    }

    logApiResponseIssue({
      endpoint: path,
      status: res.status,
      contentType,
      requestId,
      correlationId,
      code: "NON_JSON_RESPONSE",
    });

    throw new ApiClientError(
      res.status >= 500
        ? "The server is temporarily unavailable. Please try again shortly."
        : res.status === 403
          ? "You do not have permission to perform this action."
          : "Unexpected response from server. Please try again.",
      {
      status: res.status,
      code: "NON_JSON_RESPONSE",
      retryable: res.status >= 500,
      requestId,
      correlationId,
      },
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    logApiResponseIssue({
      endpoint: path,
      status: res.status,
      contentType,
      requestId,
      correlationId,
      code: "INVALID_JSON_RESPONSE",
    });
    throw new ApiClientError("Unexpected response from server. Please try again.", {
      status: res.status,
      code: "INVALID_JSON_RESPONSE",
      retryable: res.status >= 500,
      requestId,
      correlationId,
    });
  }

  if (!res.ok && (!json || typeof json !== "object")) {
    throw new ApiClientError(
      res.status === 403
        ? "You do not have permission to perform this action."
        : res.status >= 500
          ? "The server is temporarily unavailable. Please try again shortly."
          : "Request failed.",
      {
      status: res.status,
      code: "HTTP_ERROR",
      retryable: res.status >= 500,
      requestId,
      correlationId,
      },
    );
  }

  return parseEnvelope<T>(json, res.status, {
    requestId,
    correlationId,
  });
}
