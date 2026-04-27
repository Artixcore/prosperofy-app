export type FieldErrors = Record<string, string[]>;

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors: FieldErrors;
  readonly requestId?: string;
  readonly correlationId?: string;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      retryable: boolean;
      fieldErrors?: FieldErrors;
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
    this.requestId = options.requestId;
    this.correlationId = options.correlationId;
  }
}

export function isApiClientError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}
