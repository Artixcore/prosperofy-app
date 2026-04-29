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
};

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Typed fetch to Laravel core only. Expects Prosperofy JSON envelope on success bodies.
 */
export async function laravelFetch<T>(
  path: string,
  options: LaravelFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, token, signal } = options;
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
    throw new ApiClientError("Unable to connect. Please try again.", {
      status: 419,
      code: "HTTP_SESSION_EXPIRED",
      retryable: false,
      requestId,
      correlationId,
    });
  }

  if (!isJson) {
    throw new ApiClientError(
      res.status >= 500
        ? "The server is temporarily unavailable. Please try again shortly."
        : res.status === 403
          ? "You do not have permission to perform this action."
          : "Unexpected response from server.",
      {
      status: res.status,
      code: "NON_JSON_RESPONSE",
      retryable: res.status >= 500,
      requestId,
      correlationId,
      },
    );
  }

  const json: unknown = await res.json();

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
