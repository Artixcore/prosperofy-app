type Tone = "info" | "error" | "success" | "warning";

const tones: Record<Tone, string> = {
  info: "border-surface-border bg-surface-raised text-content-primary",
  error: "border-red-300/70 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100",
  success: "border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100",
  warning: "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
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
