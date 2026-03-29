type Tone = "info" | "error" | "success";

const tones: Record<Tone, string> = {
  info: "border-surface-border bg-surface-raised text-zinc-300",
  error: "border-red-900/50 bg-red-950/30 text-red-100",
  success: "border-emerald-900/50 bg-emerald-950/30 text-emerald-100",
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
