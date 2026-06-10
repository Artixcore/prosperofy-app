"use client";

import { useToast } from "@/components/system/toast-context";

type ReferralLinkCardProps = {
  code: string;
  url: string;
};

export function ReferralLinkCard({ code, url }: ReferralLinkCardProps) {
  const { pushToast } = useToast();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      pushToast({ tone: "success", title: "Referral link copied." });
    } catch {
      pushToast({
        tone: "error",
        title: "Copy this link manually.",
        description: url,
      });
    }
  }

  return (
    <article className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Referral link</h2>
      <p className="mt-1 text-sm text-content-muted">
        Share your link. Rewards are based on active memberships.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Code</p>
          <p className="mt-1 font-mono text-sm text-content-primary">{code}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Link</p>
          <p className="mt-1 break-all font-mono text-xs text-content-primary">{url}</p>
        </div>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-muted"
        >
          Copy link
        </button>
      </div>
      <p className="mt-3 text-xs text-content-muted">
        Subject to active membership. Reward rates depend on your plan.
      </p>
    </article>
  );
}
