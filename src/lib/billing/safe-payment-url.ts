const DEFAULT_PAYMENT_REDIRECT_HOST_SUFFIXES = ".nowpayments.io,.nowpayments.com";

function paymentRedirectHostSuffixes(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_HOST_SUFFIXES?.trim() ||
    DEFAULT_PAYMENT_REDIRECT_HOST_SUFFIXES;

  return raw
    .split(",")
    .map((suffix) => suffix.trim().toLowerCase())
    .filter((suffix) => suffix.length > 0);
}

/** Validates checkout redirect URLs from the Laravel billing API (defense-in-depth). */
export function isSafePaymentRedirectUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  const suffixes = paymentRedirectHostSuffixes();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    return suffixes.some((suffix) => {
      const normalized = suffix.startsWith(".") ? suffix : `.${suffix}`;
      return host === normalized.slice(1) || host.endsWith(normalized);
    });
  } catch {
    return false;
  }
}
