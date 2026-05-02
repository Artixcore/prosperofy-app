const tones: Record<string, string> = {
  pending:
    "bg-muted text-muted-foreground ring-border dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600",
  verified:
    "bg-sky-100 text-sky-950 ring-sky-400 dark:bg-sky-950/55 dark:text-sky-100 dark:ring-sky-800/70",
  claimable:
    "bg-emerald-100 text-emerald-950 ring-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800/70",
  claimed:
    "bg-secondary text-secondary-foreground ring-border dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700",
  rejected:
    "bg-rose-100 text-rose-950 ring-rose-400 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-800/70",
};

export function RewardStatusBadge({ status }: { status: string }) {
  const tone =
    tones[status] ??
    "bg-muted text-muted-foreground ring-border dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ring-1 ring-inset ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
