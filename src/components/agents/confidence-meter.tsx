/** Horizontal bar for signal confidence (0–100). */

export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full max-w-[140px]" aria-label={`Confidence ${pct}`}>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-700 to-sky-400 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-0.5 text-[10px] text-zinc-500">{pct}%</div>
    </div>
  );
}
