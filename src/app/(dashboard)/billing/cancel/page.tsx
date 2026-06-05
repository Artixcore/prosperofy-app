"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";

export default function BillingCancelPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Checkout canceled"
        description="Your crypto payment was not completed."
      />
      <InlineAlert tone="warning">
        No charge was made. You can return to billing and try again when ready.
      </InlineAlert>
      <Link href="/billing" className="text-sm text-primary underline">
        Back to billing
      </Link>
    </div>
  );
}
