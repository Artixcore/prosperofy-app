import { ApiClientError, type FieldErrors } from "./errors";

type ApiMeta = {
  correlation_id?: string;
  request_id?: string;
  [key: string]: unknown;
};

type EnvelopeSuccess<T> = {
  success: true;
  message: string;
  data: T;
  error: null;
  meta: ApiMeta;
};

type EnvelopeFailure = {
  success: false;
  message: string;
  data: unknown;
  error: {
    code: string;
    retryable: boolean;
    details: unknown[];
  };
  meta: ApiMeta;
  errors?: FieldErrors;
};

export type ApiEnvelopeJson<T> = EnvelopeSuccess<T> | EnvelopeFailure;

type EnvelopeContext = {
  requestId?: string;
  correlationId?: string;
};

function asMeta(value: unknown): ApiMeta | null {
  if (!value || typeof value !== "object") return null;
  return value as ApiMeta;
}

function asMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

export function parseEnvelope<T>(json: unknown, httpStatus: number, context: EnvelopeContext = {}): T {
  if (!json || typeof json !== "object") {
    throw new ApiClientError("Invalid response from server.", {
      status: httpStatus,
      code: "INVALID_RESPONSE",
      retryable: httpStatus >= 500,
      requestId: context.requestId,
      correlationId: context.correlationId,
    });
  }

  const body = json as Partial<ApiEnvelopeJson<T>> & { meta?: unknown; message?: unknown };
  const meta = asMeta(body.meta);
  const requestId = meta?.request_id ?? context.requestId;
  const correlationId = meta?.correlation_id ?? context.correlationId;

  if (body.success === true && typeof body.data !== "undefined") {
    return body.data;
  }

  if (body.success !== false) {
    throw new ApiClientError("Unexpected response envelope from server.", {
      status: httpStatus,
      code: "INVALID_ENVELOPE",
      retryable: httpStatus >= 500,
      requestId,
      correlationId,
    });
  }

  const code = body.error?.code ?? (httpStatus === 403 ? "FORBIDDEN" : "API_ERROR");
  const retryable = Boolean(body.error?.retryable ?? httpStatus >= 500);
  const fieldErrors = body.errors ?? {};
  const message = asMessage(
    body.message,
    httpStatus === 403 ? "You do not have permission to perform this action." : "Request failed.",
  );

  throw new ApiClientError(message, {
    status: httpStatus,
    code,
    retryable,
    fieldErrors,
    requestId,
    correlationId,
  });
}
