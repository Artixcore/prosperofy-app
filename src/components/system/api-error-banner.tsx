"use client";

import type { ReactNode } from "react";
import { displayApiError, type ApiErrorContext } from "@/lib/api/display-api-error";
import { InlineAlert } from "./inline-alert";

type Props = {
  error: unknown;
  context?: ApiErrorContext;
  tone?: "error" | "warning";
  action?: ReactNode;
};

export function ApiErrorBanner({ error, context = "default", tone = "error", action }: Props) {
  const resolved = displayApiError(error, context);

  return (
    <InlineAlert tone={tone}>
      <p>{resolved.message}</p>
      {resolved.hints.map((hint) => (
        <p key={hint} className="mt-1 text-sm opacity-90">
          {hint}
        </p>
      ))}
      {action ? <div className="mt-2">{action}</div> : null}
    </InlineAlert>
  );
}
