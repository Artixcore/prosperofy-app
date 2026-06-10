"use client";

import Link from "next/link";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { useCardOverviewQuery } from "@/features/card/use-card-overview";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function CardSuccessPage() {
  const overview = useCardOverviewQuery();

  const cardStatus = overview.data?.card.status;
  const isActive = cardStatus === "active";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Payment submitted</h1>
      <p className="text-sm text-muted-foreground">
        We are checking your payment confirmation. This may take a few moments.
      </p>

      {overview.isLoading ? <LoadingState label="Checking card status…" /> : null}

      {overview.isError ? (
        <InlineAlert tone="error">{normalizeApiError(overview.error)}</InlineAlert>
      ) : null}

      {overview.data ? (
        <InlineAlert tone={isActive ? "success" : "info"}>
          {isActive
            ? "Your Prosperity Card is active."
            : `Current card status: ${overview.data.card.status.replaceAll("_", " ")}`}
        </InlineAlert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void overview.refetch()}
          disabled={overview.isFetching}
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {overview.isFetching ? "Refreshing…" : "Refresh card status"}
        </button>
        <Link
          href="/card"
          className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Back to Prosperity Card
        </Link>
      </div>
    </div>
  );
}
