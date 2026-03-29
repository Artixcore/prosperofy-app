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

export function parseEnvelope<T>(json: unknown, httpStatus: number): T {
  if (!json || typeof json !== "object") {
    throw new ApiClientError("Invalid response from server.", {
      status: httpStatus,
      code: "INVALID_RESPONSE",
      retryable: httpStatus >= 500,
    });
  }

  const body = json as ApiEnvelopeJson<T>;

  if (body.success === true) {
    return body.data;
  }

  const code = body.error?.code ?? "API_ERROR";
  const retryable = Boolean(body.error?.retryable);
  const fieldErrors = body.errors ?? {};

  throw new ApiClientError(body.message || "Request failed.", {
    status: httpStatus,
    code,
    retryable,
    fieldErrors,
  });
}
