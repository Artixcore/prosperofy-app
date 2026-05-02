export const AGENTS_DISCLAIMER =
  "This is AI-generated market research, not financial advice. Trading involves risk, including loss of capital. " +
  "AI-generated signals are research-backed suggestions only; they do not guarantee profit. Past performance does not guarantee future results. " +
  "Use your own judgment.";

export function AgentsDisclaimerBanner() {
  return (
    <div
      role="note"
      className="rounded-md border border-amber-800/50 bg-amber-950/25 p-4 text-sm text-amber-100"
    >
      {AGENTS_DISCLAIMER}
    </div>
  );
}
