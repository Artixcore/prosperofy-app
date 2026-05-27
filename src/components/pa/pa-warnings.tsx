export function PaWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;

  return (
    <section className="rounded-lg border border-amber-300/60 bg-amber-50/80 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
      <h2 className="text-sm font-medium text-amber-950 dark:text-amber-100">Important</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100/90">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </section>
  );
}
