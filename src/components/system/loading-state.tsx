export function LoadingState({
  label = "Loading…",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-zinc-400 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-accent"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
