"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { usePaymentStatusQuery } from "@/features/billing/use-billing-checkout";
import { useCurrentSubscription } from "@/features/billing/use-current-subscription";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

const BILLING_POLL_TIMEOUT_MS = 5000 * 60;

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("paymentId");
  const statusQuery = usePaymentStatusQuery(paymentId);
  const subscriptionQuery = useCurrentSubscription({ pollUntilActive: true });
  const [pollTimedOut, setPollTimedOut] = useState(false);

  const paymentStatus = statusQuery.data?.status ?? "pending";
  const isPaid = paymentStatus === "paid";
  const subscriptionActive =
    subscriptionQuery.data?.status === "active" &&
    subscriptionQuery.data.plan_slug !== "free";
  const verified = isPaid && subscriptionActive;

  useEffect(() => {
    if (!paymentId || verified) {
      setPollTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setPollTimedOut(true), BILLING_POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [paymentId, verified]);

  if (!paymentId) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Payment received</h2>
        <p className="text-sm text-muted-foreground">
          Your payment is being verified by Prosperofy.
        </p>
        <InlineAlert tone="info">
          Return here from checkout or open Billing to view your subscription status once
          verification completes.
        </InlineAlert>
        <Link href="/settings/billing" className="text-sm text-primary underline">
          Back to billing
        </Link>
      </div>
    );
  }

  if (statusQuery.isLoading) {
    return <LoadingState label="Confirming payment…" />;
  }

  if (statusQuery.isError) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Payment status</h2>
        <p className="text-sm text-muted-foreground">We could not load your payment status.</p>
        <InlineAlert tone="error">{normalizeApiError(statusQuery.error)}</InlineAlert>
        <Link href="/settings/billing" className="text-sm text-primary underline">
          Back to billing
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">
        {verified ? "Subscription active" : "Payment being verified"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {verified
          ? `Your ${subscriptionQuery.data?.plan_name ?? "paid"} plan is now active.`
          : pollTimedOut
            ? "Verification is taking longer than expected. Check Billing in a few minutes or contact support if this persists."
            : "We are waiting for confirmation. This page refreshes automatically."}
      </p>
      <InlineAlert tone={verified ? "success" : "info"}>
        Payment status: <span className="font-medium">{paymentStatus}</span>
        {subscriptionQuery.data ? (
          <>
            {" "}
            · Subscription:{" "}
            <span className="font-medium">{subscriptionQuery.data.plan_name}</span> (
            {subscriptionQuery.data.status})
          </>
        ) : null}
      </InlineAlert>
      {!verified ? (
        <p className="text-sm text-muted-foreground">
          Premium access will unlock once your payment is confirmed.
        </p>
      ) : null}
      <Link href="/settings/billing" className="text-sm text-primary underline">
        Back to billing
      </Link>
    </div>
  );
}
