"use client";

type Props = {
  open: boolean;
  symbol: string;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function TradeSuggestionRiskModal({ open, symbol, onClose, onConfirm, pending }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => !pending && onClose()}
    >
      <div
        className="max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-suggestion-risk-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="trade-suggestion-risk-title" className="text-lg font-semibold">
          Research-only trade suggestion
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Trading involves risk and you can lose money. This suggestion is for research only and
          is not financial advice. Prosperofy does not guarantee profit or accuracy.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          A suggestion will be generated for <span className="font-medium">{symbol}</span> using
          your agent settings. No trade will be executed.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {pending ? "Generating…" : "I understand, create suggestion"}
          </button>
        </div>
      </div>
    </div>
  );
}
