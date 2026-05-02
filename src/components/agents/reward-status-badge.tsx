const tones: Record<string, string> = {
  pending: "bg-zinc-800 text-zinc-300 ring-zinc-600",
  verified: "bg-sky-950/60 text-sky-200 ring-sky-800/70",
  claimable: "bg-emerald-950/50 text-emerald-200 ring-emerald-800/70",
  claimed: "bg-zinc-900 text-zinc-400 ring-zinc-700",
  rejected: "bg-rose-950/50 text-rose-200 ring-rose-800/70",
};

export function RewardStatusBadge({ status }: { status: string }) {
  const tone = tones[status] ?? "bg-zinc-800 text-zinc-300 ring-zinc-600";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ring-1 ring-inset ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
