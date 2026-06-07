import type { BillingCheckoutResponse } from "@/lib/api/types";

/** Extracts a checkout redirect URL from Laravel billing checkout response data. */
export function resolveCheckoutUrl(data: BillingCheckoutResponse): string | null {
  const record = data as BillingCheckoutResponse & Record<string, unknown>;
  const url =
    record.payment_url ??
    record.invoice_url ??
    record.checkout_url ??
    record.paymentUrl ??
    record.invoiceUrl;

  return typeof url === "string" && url.trim() ? url.trim() : null;
}
