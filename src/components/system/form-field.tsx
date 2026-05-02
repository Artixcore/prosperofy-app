import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
};

export function FormField({ id, label, error, children, hint }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-destructive" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
