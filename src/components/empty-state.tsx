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
    <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
