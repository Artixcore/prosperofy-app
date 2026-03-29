export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-surface-border bg-surface-raised/50 px-6 py-12 text-center">
      <p className="text-base font-medium text-zinc-200">{title}</p>
      {description ? <p className="mt-2 text-sm text-zinc-500">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
