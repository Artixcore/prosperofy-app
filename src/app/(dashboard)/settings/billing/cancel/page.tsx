import Link from "next/link";
import { InlineAlert } from "@/components/system/inline-alert";

export default function BillingCancelPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Checkout canceled</h2>
      <p className="text-sm text-muted-foreground">
        Your payment checkout was canceled or not completed.
      </p>
      <InlineAlert tone="warning">
        No charge was made. You can return to Billing and try again when ready.
      </InlineAlert>
      <Link href="/settings/billing" className="text-sm text-primary underline">
        Back to billing
      </Link>
    </div>
  );
}
