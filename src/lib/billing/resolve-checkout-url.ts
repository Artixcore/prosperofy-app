/** Extracts a checkout redirect URL from Laravel payment checkout response data. */
export function resolveCheckoutUrl(data: Record<string, unknown>): string | null {
  const record = data;
  const url =
    record.payment_url ??
    record.invoice_url ??
    record.checkout_url ??
    record.paymentUrl ??
    record.invoiceUrl;

  return typeof url === "string" && url.trim() ? url.trim() : null;
}
