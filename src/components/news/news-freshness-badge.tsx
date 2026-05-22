type Props = {
  freshness?: string | null;
};

export function NewsFreshnessBadge({ freshness }: Props) {
  const label = freshness ?? "unknown";
  const tone =
    label === "live"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : label === "cached"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
        : label === "disabled"
          ? "bg-muted text-muted-foreground"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>
      {label}
    </span>
  );
}
