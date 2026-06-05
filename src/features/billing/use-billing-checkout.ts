"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  BillingCheckoutBody,
  BillingCheckoutResponse,
  PaymentStatusResponse,
} from "@/lib/api/types";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";

const BILLING_POLL_INTERVAL_MS = 5000;
const BILLING_POLL_MAX_FETCHES = 60;

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useBillingCheckoutMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: BillingCheckoutBody) =>
      laravelFetch<BillingCheckoutResponse>(API.app.billing.checkout, {
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
      if (query.state.dataUpdateCount >= BILLING_POLL_MAX_FETCHES) {
        return false;
      }
      return BILLING_POLL_INTERVAL_MS;
    },
    retry: 1,
  });
}
