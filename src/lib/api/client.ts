import { parseEnvelope } from "./envelope";
import { ApiClientError } from "./errors";

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

  const res = await fetch(url, {
    method,
    headers,
    body: initBody,
    signal,
    credentials: "omit",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (res.status === 401) {
    throw new ApiClientError("Session expired. Please sign in again.", {
      status: 401,
      code: "UNAUTHENTICATED",
      retryable: false,
    });
  }

  if (!isJson) {
    throw new ApiClientError("Unexpected response from server.", {
      status: res.status,
      code: "NON_JSON_RESPONSE",
      retryable: res.status >= 500,
    });
  }

  const json: unknown = await res.json();

  if (!res.ok && (!json || typeof json !== "object")) {
    throw new ApiClientError("Request failed.", {
      status: res.status,
      code: "HTTP_ERROR",
      retryable: res.status >= 500,
    });
  }

  return parseEnvelope<T>(json, res.status);
}
