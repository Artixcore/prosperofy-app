export type FieldErrors = Record<string, string[]>;

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors: FieldErrors;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      retryable: boolean;
      fieldErrors?: FieldErrors;
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function isApiClientError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}
