type Tone = "info" | "error" | "success" | "warning";

const tones: Record<Tone, string> = {
  info: "border-border bg-muted text-foreground",
  error:
    "border-red-300 bg-red-50 text-red-950 dark:border-red-900/55 dark:bg-red-950/35 dark:text-red-50",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/55 dark:bg-emerald-950/35 dark:text-emerald-50",
  warning:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-50",
};

export function InlineAlert({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${tones[tone]}`} role="status">
      {children}
    </div>
  );
}
