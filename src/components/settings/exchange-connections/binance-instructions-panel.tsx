"use client";

import { InlineAlert } from "@/components/system/inline-alert";

export function BinanceInstructionsPanel() {
  return (
    <div className="min-w-0 max-w-full rounded-lg border border-surface-border bg-surface-raised/40 p-5">
      <h3 className="text-sm font-semibold text-foreground">How to connect Binance safely</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Log in to Binance.</li>
        <li>Go to Profile → Account → API Management.</li>
        <li>Create a new API key.</li>
        <li>
          Recommended name/label: <strong className="text-foreground">Prosperofy</strong>
        </li>
        <li>
          Make sure your Binance account has 2FA enabled, identity verification completed, and Spot
          Wallet activated.
        </li>
        <li>
          Permissions: enable <strong className="text-foreground">Reading</strong> (required). Enable{" "}
          <strong className="text-foreground">Spot &amp; Margin Trading</strong> only if you want
          Prosperofy trading. Disable withdrawals.
        </li>
        <li>
          IP restriction: strongly recommend restricting the API key to Prosperofy backend outbound IP
          addresses when available.
        </li>
        <li>Never share this API key or secret outside Prosperofy.</li>
        <li>The Secret Key is shown only once by Binance — paste it immediately.</li>
        <li>You can revoke the API key anytime from Binance API Management.</li>
      </ol>
      <InlineAlert tone="info">
        For portfolio-only mode, use Reading permission only. For trading mode, enable Spot trading
        only when you understand the risk. Withdrawal permission is unsupported and unsafe —
        Prosperofy will reject keys with withdrawal access.
      </InlineAlert>
      <div className="mt-3">
        <InlineAlert tone="warning">
        If Prosperofy does not have stable outbound IPs yet, trading permissions may not be allowed or
        may be unsafe. Prefer a read-only key until IP restrictions can be configured.
        </InlineAlert>
      </div>
    </div>
  );
}
