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
      <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-zinc-500" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
