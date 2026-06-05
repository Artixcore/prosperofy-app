"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  NowPaymentCreateBody,
  NowPaymentCreateResponse,
  PaymentStatusResponse,
} from "@/lib/api/types";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useCreateNowPaymentMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: NowPaymentCreateBody) =>
      laravelFetch<NowPaymentCreateResponse>(API.app.billing.createNowPayment, {
        method: "POST",
        body,
        token: assertToken(token),
        idempotencyKey: crypto.randomUUID(),
      }),
    retry: false,
  });
}

export function usePaymentStatusQuery(paymentId: string | null) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["payment-status", paymentId, token],
    queryFn: () =>
      laravelFetch<PaymentStatusResponse>(
        API.app.billing.paymentStatus(String(paymentId)),
        { token: assertToken(token) },
      ),
    enabled: Boolean(authReady && isAuthenticated && token && paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "paid" || status === "failed" || status === "expired") {
        return false;
      }
      return 5000;
    },
    retry: 1,
  });
}
