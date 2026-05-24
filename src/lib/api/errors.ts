export type FieldErrors = Record<string, string[]>;

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors: FieldErrors;
  readonly data?: Record<string, unknown>;
  readonly requestId?: string;
  readonly correlationId?: string;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      retryable: boolean;
      fieldErrors?: FieldErrors;
      data?: Record<string, unknown>;
      requestId?: string;
      correlationId?: string;
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable;
    this.fieldErrors = options.fieldErrors ?? {};
    this.data = options.data;
    this.requestId = options.requestId;
    this.correlationId = options.correlationId;
  }
}

export function isApiClientError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}

export function getApiErrorData(error: unknown): Record<string, unknown> | null {
  if (!isApiClientError(error) || !error.data || typeof error.data !== "object") {
    return null;
  }
  return error.data;
}

export function getApiErrorField(error: unknown, key: string): string | null {
  const data = getApiErrorData(error);
  if (!data) return null;
  const value = data[key];
  return typeof value === "string" ? value : null;
}
