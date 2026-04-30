import { QueryClient } from "@tanstack/react-query";
import { isApiClientError } from "@/lib/api/errors";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiClientError(error)) {
            if ([401, 403, 404, 419, 422].includes(error.status)) return false;
            if (!error.retryable) return false;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          if (isApiClientError(error)) {
            if ([400, 401, 403, 404, 419, 422].includes(error.status)) return false;
            if (!error.retryable) return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}
